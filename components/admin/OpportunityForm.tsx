'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

export default function OpportunityForm() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    investment_amount: '',
    product_type: 'JV_FLIP',
    status: 'AVAILABLE',
    description: '',
    suburb_or_area: '',
    province: '',
    hero_image_url: '',

    // V2 Fields
    projected_net_profit: '',
    projected_net_annualized_return: '',

    // V3 Fields
    net_rental_income: '',
    capital_growth: '',
    gross_return: '',
    external_fees: '',
    contract_duration_months: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('opportunities')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data } = supabase.storage
        .from('opportunities')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, hero_image_url: data.publicUrl }));

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Helper to parse numbers safely
      const parseNum = (val: string) => val ? parseFloat(val) : null;
      const parseIntVal = (val: string) => val ? parseInt(val) : null;

      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          investment_amount: parseNum(formData.investment_amount),
          projected_net_profit: parseNum(formData.projected_net_profit),
          projected_net_annualized_return: parseNum(formData.projected_net_annualized_return),
          net_rental_income: parseNum(formData.net_rental_income),
          capital_growth: parseNum(formData.capital_growth),
          gross_return: parseNum(formData.gross_return),
          external_fees: parseNum(formData.external_fees),
          contract_duration_months: parseIntVal(formData.contract_duration_months)
        }),
      });

      if (!res.ok) throw new Error('Failed to create');

      router.push('/admin'); // Redirect to dashboard
      router.refresh();

    } catch (error) {
      console.error(error);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto space-y-6">

      {/* Header Section */}
      <div className="border-b pb-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
        <input
          type="text"
          name="title"
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-gray-900"
          placeholder="e.g. Luxury Apartment in Sandton"
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (R)</label>
          <input
            type="number"
            name="investment_amount"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-gray-900"
            placeholder="1000000"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="product_type"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 outline-none  text-gray-900"
            onChange={handleChange}
            defaultValue="JV_FLIP"
          >
            <optgroup label="On Sale">
              <option value="FLIP_BREATHER">Breather (Flip)</option>
              <option value="FLIP_INSTALMENT">Instalment Sale Breather</option>
              <option value="FLIP_JV">Joint Venture Flip</option>
            </optgroup>
            <optgroup label="Recovery">
              <option value="RECOVERY_LEASEBACK">Buy & Leaseback</option>
              <option value="RECOVERY_INSTALMENT">Instalment Sale Recovery</option>
              <option value="RECOVERY_BOND">Recovery Bond</option>
            </optgroup>
            <optgroup label="Other">
              <option value="ASSIST_TO_OWN">Assist to Own</option>
              <option value="RENTAL_INCOME">Rental Income</option>
              <option value="DEVELOPMENT">Development</option>
              <option value="JV_FLIP">JV Flip</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
          <input
            type="text"
            name="suburb_or_area"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-gray-900"
            placeholder="e.g. Sandton"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
          <input
            type="text"
            name="province"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-gray-900"
            placeholder="e.g. Gauteng"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Financials Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Financial Projections</h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Projected Annual Return (%)</label>
            <input type="number" step="0.01" name="projected_net_annualized_return" placeholder="e.g. 15.5" className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gold-500 bg-white text-gray-900" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Projected Total Profit (R)</label>
            <input type="number" name="projected_net_profit" className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gold-500 bg-white text-gray-900" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Contract Duration (Months)</label>
            <input type="number" name="contract_duration_months" className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gold-500 bg-white text-gray-900" onChange={handleChange} />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Detailed Breakdown (Optional)</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Net Rental Income (R)</label>
              <input type="number" name="net_rental_income" className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gold-500 bg-white text-gray-900" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Capital Growth (R)</label>
              <input type="number" name="capital_growth" className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gold-500 bg-white text-gray-900" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gross Return (R)</label>
              <input type="number" name="gross_return" className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gold-500 bg-white text-gray-900" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">External Fees (R)</label>
              <input type="number" name="external_fees" className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gold-500 bg-white text-gray-900" onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-gray-900"
          placeholder="Describe the opportunity..."
          onChange={handleChange}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
          {uploading ? (
            <p className="text-gold-600 animate-pulse">Uploading...</p>
          ) : formData.hero_image_url ? (
            <div className="relative h-40 w-full">
              <img src={formData.hero_image_url} alt="Preview" className="h-full w-full object-cover rounded-md" />
              <p className="mt-2 text-xs text-green-600">Image Uploaded!</p>
            </div>
          ) : (
            <div className="space-y-1 text-gray-500">
              <p>Click or drag image here</p>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Create Opportunity'}
      </button>
    </form>
  );
}