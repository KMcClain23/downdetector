// pages/index.js
import { useState } from 'react';
import axios from 'axios';

const ISPS = ['ziply', 'xfinity', 'spectrum', 'verizon', 'centurylink'];

export default function Home() {
  const [zip, setZip] = useState('');
  const [results, setResults] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const fetchOutages = async () => {
    if (!zip) return;

    setResults({});
    setHasSearched(true);

    for (const isp of ISPS) {
      setLoadingMap((prev) => ({ ...prev, [isp]: true }));

      try {
        const res = await axios.get(`http://localhost:5000/api/outages/scrape/${zip}/${isp}`);
        setResults((prev) => ({ ...prev, [isp]: res.data }));
      } catch (err) {
        setResults((prev) => ({
          ...prev,
          [isp]: { isp, status: 'error', summary: 'Failed to fetch data.', timestamp: new Date() },
        }));
      } finally {
        setLoadingMap((prev) => ({ ...prev, [isp]: false }));
      }
    }
  };

  const handleSubscribe = async () => {
    if (!subEmail || !zip) {
      setSubMsg('Please enter both email and ZIP code.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/subscribe', {
        email: subEmail,
        zipCode: zip,
      });
      setSubMsg('✅ Subscribed successfully!');
      setSubEmail('');
    } catch (err) {
      setSubMsg('❌ Subscription failed. Try again.');
    }
  };

  const resetSearch = () => {
    setZip('');
    setResults({});
    setHasSearched(false);
    setSubMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1
        className="text-3xl font-bold mb-6 text-center text-blue-700 cursor-pointer"
        onClick={resetSearch}
      >
        DownDetector
      </h1>

      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOutages();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Enter ZIP code"
            className="flex-grow p-2 border rounded"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 rounded">
            Search
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {hasSearched &&
            ISPS.map((isp) => (
              <div key={isp} className="border-b pb-4">
                <h2 className="text-xl font-semibold capitalize">{isp}</h2>
                {loadingMap[isp] ? (
                  <p className="text-sm text-gray-500">🔄 Loading...</p>
                ) : results[isp] ? (
                  <>
                    <p><strong>Status:</strong> {results[isp].status}</p>
                    <p><strong>Time:</strong> {new Date(results[isp].timestamp).toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No data available.</p>
                )}
              </div>
            ))}
        </div>

        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-2">Subscribe for Alerts</h3>
          <input
            type="email"
            placeholder="Your email"
            className="w-full p-2 border rounded mb-2"
            value={subEmail}
            onChange={(e) => setSubEmail(e.target.value)}
          />
          <button
            onClick={handleSubscribe}
            className="w-full bg-green-600 text-white px-4 py-2 rounded"
          >
            Subscribe
          </button>
          {subMsg && <p className="mt-2 text-sm text-gray-600">{subMsg}</p>}
        </div>

        <div className="mt-10 max-w-md mx-auto bg-white p-4 rounded shadow text-sm text-gray-700 border border-gray-200">
          <h3 className="font-semibold mb-2 text-blue-700">Outage Status Key</h3>
          <ul className="space-y-1">
            <li><strong className="text-green-600">Normal</strong>: No known problems reported</li>
            <li><strong className="text-yellow-600">Suspected</strong>: Possible issues reported by users</li>
            <li><strong className="text-red-600">Error</strong>: Could not determine status due to technical issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
