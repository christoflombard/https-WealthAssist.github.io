'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database } from '@/lib/supabase/database.types';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];

export default function AdminDashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch('/api/opportunities');
        const json = await res.json();
        if (json.success) {
          setOpportunities(json.data);
        }
      } catch (error) {
        console.error('Error loading opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Properties</h2>
        <Link
          href="/admin/create"
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gold-600 transition-colors shadow-lg"
        >
          Add Property
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500 mb-4">No properties found.</p>
          <Link href="/admin/create" className="text-gold-600 font-medium hover:underline">
            Create your first one &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                {opp.hero_image_url && (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative">
                    <img src={opp.hero_image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{opp.title}</h3>
                  <div className="text-sm text-gray-500">
                    {opp.product_type} • {opp.status}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-mono text-gray-600 font-medium">
                  R {opp.investment_amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}