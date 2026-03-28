import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contentApi } from '../../api/client';
import Loader from '../Common/Loader';

const CMSPage: React.FC = () => {
    const { link } = useParams<{ link: string }>();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!link) return;
        setLoading(true);
        contentApi.getCmsPage(link).then((res: any) => {
            setPage(res?.data?.data || res?.data || null);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [link]);

    if (loading) return <Loader text="Loading..." />;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {page ? (
                <>
                    <h1 className="text-2xl font-bold font-display text-neutral-gray-800 mb-6">{page.title}</h1>
                    <div className="prose prose-sm max-w-none text-brand-text" dangerouslySetInnerHTML={{ __html: page.content || page.body || '' }} />
                </>
            ) : (
                <div className="text-center text-brand-text py-12">Page not found.</div>
            )}
        </div>
    );
};

export default CMSPage;
