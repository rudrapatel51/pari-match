import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentApi } from '../../api/client';
import Loader from '../Common/Loader';
import { FiArrowLeft } from 'react-icons/fi';

const BlogDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        contentApi.getBlogDetail(slug).then((res: any) => {
            setBlog(res?.data?.data || res?.data || null);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <Loader text="Loading..." />;
    if (!blog) return <div className="p-8 text-center text-brand-text">Blog post not found.</div>;

    return (
        <div className="max-w-3xl mx-auto p-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-text hover:underline text-sm mb-6">
                <FiArrowLeft className="w-4 h-4" />
                Back to Blogs
            </button>
            {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover rounded-lg mb-6" />}
            <h1 className="text-2xl font-bold font-display text-neutral-gray-800 mb-2">{blog.title}</h1>
            <p className="text-xs text-neutral-gray-600 mb-6">{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}</p>
            <div className="prose prose-sm max-w-none text-brand-text" dangerouslySetInnerHTML={{ __html: blog.content || blog.body || '' }} />
        </div>
    );
};

export default BlogDetailPage;
