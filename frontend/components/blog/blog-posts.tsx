import BlogCard from '@/components/blog/blog-card';
import LatestBlogCard from '@/components/blog/latest-blog-card';
import { formatDate } from '@/lib/utils';

export function BlogPosts({ posts }) {
    const latestPost = posts[0];
    return (
        <div className="container space-y-10 py-6 md:py-10">
            <section>
                <h2 className="mb-4 font-bold text-2xl">Latest Post</h2>
                <LatestBlogCard
                    key={latestPost._id}
                    title={latestPost.title}
                    description={latestPost.description}
                    date={formatDate(latestPost.date)}
                    href={latestPost.slug}
                />
            </section>

            <section>
                <h2 className="mb-4 font-bold text-2xl">Blog Posts</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.slice(1).map((post) => (
                        <BlogCard key={post._id} title={post.title} description={post.description} date={formatDate(post.date)} href={post.slug} />
                    ))}
                </div>
            </section>
        </div>
    );
}
