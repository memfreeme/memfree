use axum::{
    http::StatusCode, routing::{get, post}, Extension, Json, Router
};
use fastembed::{TextEmbedding, InitOptions, EmbeddingModel};
use serde::{Deserialize, Serialize};
use anyhow::Result;
use std::{net::SocketAddr, sync::Arc};
use dotenv::dotenv;
use hyper::Request;
use axum::middleware::{self, Next};
use std::time::Instant;

#[derive(Deserialize)]
struct EmbedRequest {
    documents: Vec<String>,
}

#[derive(Serialize)]
struct EmbedResponse {
    embeddings: Vec<Vec<f32>>,
}

#[derive(Deserialize)]
struct RerankRequest {
    query: String,
    documents: Vec<String>,
}

#[derive(Serialize)]
struct RerankDoc {
    document: String,
    similarity: f32,
}

#[derive(Serialize)]
struct RerankResponse {
    top_docs: Vec<RerankDoc>,
}

fn cosine_similarity(vec1: &[f32], vec2: &[f32]) -> f32 {
    let dot_product = vec1.iter().zip(vec2.iter()).map(|(a, b)| a * b).sum::<f32>();
    let magnitude1 = vec1.iter().map(|v| v * v).sum::<f32>().sqrt();
    let magnitude2 = vec2.iter().map(|v| v * v).sum::<f32>().sqrt();
    return dot_product / (magnitude1 * magnitude2);
}

async fn rerank_handler(
    Extension(model): Extension<Arc<TextEmbedding>>, 
    Json(payload): Json<RerankRequest>
) -> Result<Json<RerankResponse>, String> {

    let query_embedding = match model.embed(vec![payload.query], None) {
        Ok(mut embeddings) => embeddings.pop().ok_or("Failed to generate query embedding")?,
        Err(err) => return Err(format!("Failed to generate query embedding: {}", err)),
    };

    let doc_embeddings = match model.embed(payload.documents.clone(), None) {
        Ok(embeddings) => embeddings,
        Err(err) => return Err(format!("Failed to generate document embeddings: {}", err)),
    };

    let mut similarities: Vec<RerankDoc> =
    payload.documents.into_iter()
    .zip(doc_embeddings.into_iter())
    .map(|(doc, doc_embedding)| {
        let similarity = cosine_similarity(&query_embedding, &doc_embedding);
        RerankDoc {
            document: doc,
            similarity,
        }
    })
    .collect();

    // Sort by similarity in descending order
    similarities.sort_by(|a, b| b.similarity.partial_cmp(&a.similarity).unwrap());

    // Take the top 10 most similar docs
    let top_docs: Vec<RerankDoc> = similarities.into_iter().take(10).collect();

    Ok(Json(RerankResponse { top_docs }))
}

async fn embed_handler(
    Extension(model): Extension<Arc<TextEmbedding>>,
    Json(payload): Json<EmbedRequest>
) -> Result<Json<EmbedResponse>, String> {
    let start_time = Instant::now();
    let document_count = payload.documents.len();

    match model.embed(payload.documents, None) {
        Ok(embeddings) => {
            let duration = start_time.elapsed();
            println!(
                "Embedding completed in {:?} for {} documents",
                duration,
                document_count
            );
            Ok(Json(EmbedResponse {
                embeddings,
            }))
        },
        Err(err) => {
            let duration = start_time.elapsed();
            println!(
                "Failed to generate embeddings in {:?} for {} documents: {}",
                duration,
                document_count,
                err
            );
            Err(format!("Failed to generate embeddings: {}", err))
        },
    }
}


async fn require_auth<B>(req: Request<B>, next: Next<B>) -> impl axum::response::IntoResponse {
    dotenv().ok();
    let expected_token = std::env::var("API_TOKEN").expect("API_TOKEN must be set");

    if let Some(token) = req.headers().get("Authorization") {
        if token.to_str().unwrap() == expected_token {
            return Ok(next.run(req).await);
        }
    }
    Result::<_, StatusCode>::Err(StatusCode::UNAUTHORIZED)
}

async fn root_handler() -> &'static str {
    "welcome"
}

#[tokio::main]
async fn main() -> Result<()> {
    let model = TextEmbedding::try_new(InitOptions {
    model_name: EmbeddingModel::ParaphraseMLMiniLML12V2Q,
    show_download_progress: true,
    ..Default::default()
    })?;

    let model = Arc::new(model);

    let open_routes = Router::new()
    .route("/", get(root_handler));

    let protected_routes = Router::new()
    .route("/embed", post(embed_handler))
    .route("/rerank", post(rerank_handler))
    .layer(middleware::from_fn(require_auth))
    .layer(axum::extract::Extension(model));

    let app = Router::new()
    .nest("/", open_routes)
    .nest("/", protected_routes);

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "3003".to_string())
        .parse()
        .expect("Failed to parse the PORT environment variable");

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("Listening on http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use fastembed::{TextEmbedding, InitOptions, EmbeddingModel};

    #[tokio::test]
    async fn test_cosine_similarity() {

        let vec1 = vec![1.0, 2.0, 3.0];
        let vec2 = vec![1.0, 2.0, 3.0];

        assert!(cosine_similarity(&vec1, &vec2) > 0.9999999);

        let vec3 = vec![1.0, 0.0, -1.0];
        let result = cosine_similarity(&vec1, &vec3);
        assert!(result.abs() < 0.5);
    }

    async fn get_model() -> Arc<TextEmbedding> {
        let model = TextEmbedding::try_new(InitOptions {
            model_name: EmbeddingModel::ParaphraseMLMiniLML12V2Q,
            show_download_progress: true,
            ..Default::default()
        }).unwrap();
        Arc::new(model)
    }

    async fn calculate_cosine_similarity(documents: &[&str], threshold: f32)   {
        let model = get_model().await;
        assert!(documents.len() == 2, "The documents array must contain exactly two elements.");

        let doc1 = documents[0];
        let doc2 = documents[1];

        let documents_vec = vec![doc1.to_string(), doc2.to_string()];
        let embeddings =  model.embed(documents_vec, None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("Cosine similarity: {}", distance);
        assert!(distance >= threshold);
    }

    #[tokio::test]
    async fn test_embedding() {
        let model = get_model().await;
        let documents = vec![
            "what is fastembed-js licensed",
            "fastembed-js is licensed under MIT ",
            "memfree is a ai search engine",
            "hybrid ai search engine",
            "what is fastembed-js licensed",
            "fastembed-js is licensed under MIT ",
            "memfree is a ai search engine",
            "hybrid ai search engine",
            "what is fastembed-js licensed",
            "fastembed-js is licensed under MIT ",
            "memfree is a ai search engine",
            "hybrid ai search engine",
            ];

        let embeddings = model.embed(documents, None).unwrap();
        assert_eq!(embeddings.len(), 12);
        assert_eq!(embeddings[0].len(), 384);


        calculate_cosine_similarity(&[
            "what is fastembed-js licensed",
            "fastembed-js licensed is under MIT ",
        ], 0.76).await;

        calculate_cosine_similarity(&["search", "google"], 0.63).await;
        calculate_cosine_similarity(&["apple", "fruit"], 0.55).await;
        calculate_cosine_similarity(&["man", "women"], 0.46).await;
        calculate_cosine_similarity(&["man", "男人"], 0.95).await;
        calculate_cosine_similarity(&["apple", "waht is apple, a IT company"], 0.84).await;
        calculate_cosine_similarity(&["memfree is a hybrid ai search engine", "what is memfree"], 0.86).await;
        calculate_cosine_similarity(&["memfree is a hybrid ai search engine", "什么是 memfree"], 0.85).await;
        calculate_cosine_similarity(&["google is a hybrid ai search engine", "what is google"], 0.79).await;
        calculate_cosine_similarity(& ["google is a hybrid ai search engine", "谷歌是一个混合ai搜索引擎"], 0.83).await;
        calculate_cosine_similarity(&["谷歌是一个混合ai搜索引擎", "what is google"], 0.85).await;

        calculate_cosine_similarity(&[ "MemFree is a open source Hybrid AI Search Engine.
        With MemFree, you could instantly get Accurate Answers from the Internet, Bookmarks, Notes, and Docs.
        This documentation is a user guide for MemFree. It will help you to get started with MemFree, and show you how to use MemFree to its full potential.", "what is memfree"], 0.64).await;

        calculate_cosine_similarity(&[ "MemFree is a open source Hybrid AI Search Engine.
        With MemFree, you could instantly get Accurate Answers from the Internet, Bookmarks, Notes, and Docs.
        This documentation is a user guide for MemFree. It will help you to get started with MemFree, and show you how to use MemFree to its full potential.", "memfree 是什么"], 0.65).await;

        calculate_cosine_similarity(&["### AI Search with Twitter Content
    MemFree now offers AI Search and Ask features using Twitter content.
    If you enjoy Twitter and are interested in exploring its content, we invite you to try MemFree's AI-powered search function based on Twitter data.", "could memfree search twitter content"], 0.63).await;

        calculate_cosine_similarity(&[ "### AI Search with Twitter Content
        MemFree now offers AI Search and Ask features using Twitter content.
        If you enjoy Twitter and are interested in exploring its content, we invite you to try MemFree's AI-powered search function based on Twitter data.", "memfree 可以搜索 twitter 吗"], 0.73).await;

    }

}