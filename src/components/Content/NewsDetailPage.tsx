import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentApi } from '../../api/client';
import Loader from '../Common/Loader';
import { FiArrowLeft } from 'react-icons/fi';

const NewsDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!slug) return;
        contentApi.getNewsDetail(slug)
            .then((res: any) => {
                setArticle(res?.data?.data || res?.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <Loader text="Loading article..." />;
    if (!article) {
        return (
            <div className="container mx-auto p-4 text-brand-text">
                Article not found.
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-brand-text text-sm mb-4 hover:underline"
            >
                <FiArrowLeft className="w-4 h-4" /> Back to News
            </button>
            {article.image && (
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 md:h-64 object-cover rounded-lg mb-4"
                />
            )}
            <h1 className="text-2xl font-bold font-display text-neutral-gray-800 mb-2">
                {article.title}
            </h1>
            <p className="text-xs text-neutral-gray-600 mb-4">
                {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ''}
            </p>
            <div
                className="prose prose-sm max-w-none text-brand-text"
                dangerouslySetInnerHTML={{ __html: article.content || article.body || '' }}
            />
        </div>
    );
};

export default NewsDetailPage;
