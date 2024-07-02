use axum::{
    routing::post,
    Router, Json, Extension, http::{StatusCode},
};
use fastembed::{TextEmbedding, InitOptions, EmbeddingModel};
use serde::{Deserialize, Serialize};
use anyhow::Result;
use std::{net::SocketAddr, sync::Arc};
use dotenv::dotenv;
use hyper::Request;
use axum::middleware::{self, Next};

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
    match model.embed(payload.documents, None) {
        Ok(embeddings) => {
            Ok(Json(EmbedResponse {
                embeddings,
            }))
        },
        Err(err) => Err(format!("Failed to generate embeddings: {}", err)),
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

#[tokio::main]
async fn main() -> Result<()> {
    // https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/baai_general_embedding


    let model = TextEmbedding::try_new(InitOptions {
    model_name: EmbeddingModel::AllMiniLML6V2,
    show_download_progress: true,
    ..Default::default()
    })?;

    let model = Arc::new(model);

    let app = Router::new()
        .route("/embed", post(embed_handler))
        .route("/rerank", post(rerank_handler))
        .layer(middleware::from_fn(require_auth))
        .layer(axum::extract::Extension(model));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3003));
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
            model_name: EmbeddingModel::AllMiniLML6V2,
            show_download_progress: true,
            ..Default::default()
        }).unwrap();
        Arc::new(model)
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


        let documents = [
            "what is fastembed-js licensed",
            "fastembed-js licensed is under MIT ",
        ];

        let embeddings = model.embed(documents.to_vec(), None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("distance {}", distance);
        assert!(distance > 0.9);

        let documents = ["memfree", "fastembed-js is licensed under MIT "];
        let embeddings = model.embed(documents.to_vec(), None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("distance {}", distance);
        assert!(distance < 0.8);

        let documents = ["search", "google"];
        let embeddings = model.embed(documents.to_vec(), None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("distance {}", distance);
        assert!(distance > 0.6);

        let documents = ["apple", "fruit"];
        let embeddings = model.embed(documents.to_vec(), None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("distance {}", distance);
        assert!(distance > 0.70);

        let documents: [&str; 2] = ["man", "women"];
        let embeddings = model.embed(documents.to_vec(), None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("distance {}", distance);
        assert!(distance > 0.8);

        let documents: [&str; 2] = ["apple", "waht is apple, a IT company"];
        let embeddings = model.embed(documents.to_vec(), None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("distance {}", distance);
        assert!(distance > 0.9);

        let documents: [&str; 2] = ["memfree is a hybrid ai search engine", "what is memfree"];
        let embeddings = model.embed(documents.to_vec(), None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("distance {}", distance);
        assert!(distance > 0.8);

        let documents: [&str; 2] = ["google is a hybrid ai search engine", "what is google"];
        let embeddings = model.embed(documents.to_vec(), None).unwrap();
        let distance = cosine_similarity(&embeddings[0], &embeddings[1]);
        println!("distance {}", distance);
        assert!(distance > 0.8);
    }

}