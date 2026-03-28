import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../../api/client';
import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import Pagination from '../Common/Pagination';

const NewsPage: React.FC = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        contentApi.getNews({ page, limit: 12 })
            .then((res: any) => {
                const data = res?.data?.data || res?.data || {};
                setNews(Array.isArray(data) ? data : data.news || data.items || []);
                setTotalPages(data.totalPages || data.total_pages || 1);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [page]);

    if (loading) return <Loader text="Loading news..." />;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold font-display text-neutral-gray-800 mb-6">Latest News</h1>
            {news.length === 0 ? (
                <EmptyState title="No News" description="No news articles available yet." />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {news.map((item: any) => (
                            <div
                                key={item._id || item.slug}
                                onClick={() => navigate(`/news/${item.slug || item._id}`)}
                                className="bg-bg-white border border-stroke-light rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                            >
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-40 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <h2 className="font-bold text-neutral-gray-800 mb-1 line-clamp-2">
                                        {item.title}
                                    </h2>
                                    <p className="text-sm text-brand-text line-clamp-2">
                                        {item.excerpt || item.description}
                                    </p>
                                    <p className="text-xs text-neutral-gray-600 mt-2">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </div>
    );
};

export default NewsPage;
