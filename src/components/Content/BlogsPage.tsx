import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../../api/client';
import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import Pagination from '../Common/Pagination';

const BlogsPage: React.FC = () => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const res = await contentApi.getBlogs({ page: p }) as any;
            const data = res?.data?.data || res?.data || [];
            setBlogs(Array.isArray(data) ? data : []);
            setTotalPages(res?.data?.pagination?.totalPages || 1);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    if (loading) return <Loader text="Loading blogs..." />;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold font-display text-neutral-gray-800 mb-6">Blogs</h1>
            {blogs.length === 0 ? (
                <EmptyState title="No Blogs" description="Blog posts will appear here." />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {blogs.map((b: any) => (
                            <div key={b._id || b.slug} onClick={() => navigate(`/blog/${b.slug}`)}
                                className="bg-bg-card border border-stroke-light rounded-lg overflow-hidden cursor-pointer hover:shadow-betting-card transition-shadow">
                                {b.image && <img src={b.image} alt={b.title} className="w-full h-40 object-cover" />}
                                <div className="p-4">
                                    <p className="text-xs text-brand-text font-medium mb-1">{b.category || 'General'}</p>
                                    <h2 className="font-bold text-neutral-gray-800 mb-2 line-clamp-2">{b.title}</h2>
                                    <p className="text-sm text-brand-text line-clamp-3">{b.excerpt || b.description}</p>
                                    <p className="text-xs text-neutral-gray-600 mt-3">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); load(p); }} className="mt-8" />
                </>
            )}
        </div>
    );
};

export default BlogsPage;
