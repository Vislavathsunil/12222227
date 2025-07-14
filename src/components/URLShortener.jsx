import React, { useState } from 'react';
import { shortenUrls } from '../services/urlShortenerService';
import logger from '../Logging Middleware/logger';

const initialInput = { longUrl: '', validity: '', customCode: '' };

function validateInput({ longUrl, validity, customCode }) {
    let errors = {};
    try {
        new URL(longUrl);
    } catch {
        errors.longUrl = 'Invalid URL';
    }
    if (validity && (!Number.isInteger(Number(validity)) || Number(validity) <= 0)) {
        errors.validity = 'Validity must be a positive integer';
    }
    if (customCode && !/^[a-zA-Z0-9]{4,12}$/.test(customCode)) {
        errors.customCode = 'Shortcode must be 4-12 alphanumeric characters';
    }
    return errors;
}

const URLShortener = () => {
    const [input, setInput] = useState(initialInput);
    const [result, setResult] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateInput(input);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            logger.warn('Validation failed for input');
            return;
        }
        if (input.longUrl.trim() === '') return;
        const resArr = shortenUrls([input]);
        setResult(resArr[0]);
        logger.info('Shorten URL submitted');
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Shorten a URL</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 border p-2 rounded">
                    <label className="block mb-1">Long URL:</label>
                    <input
                        type="text"
                        value={input.longUrl}
                        onChange={e => handleChange('longUrl', e.target.value)}
                        className="border px-2 py-1 w-full"
                    />
                    {errors.longUrl && <span className="text-red-600 text-sm">{errors.longUrl}</span>}

                    <label className="block mt-2 mb-1">Validity (minutes, optional):</label>
                    <input
                        type="number"
                        value={input.validity}
                        onChange={e => handleChange('validity', e.target.value)}
                        className="border px-2 py-1 w-full"
                    />
                    {errors.validity && <span className="text-red-600 text-sm">{errors.validity}</span>}

                    <label className="block mt-2 mb-1">Custom Shortcode (optional):</label>
                    <input
                        type="text"
                        value={input.customCode}
                        onChange={e => handleChange('customCode', e.target.value)}
                        className="border px-2 py-1 w-full"
                    />
                    {errors.customCode && <span className="text-red-600 text-sm">{errors.customCode}</span>}
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Shorten URL</button>
            </form>

            {result && (
                <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2">Result</h3>
                    {result.error ? (
                        <div className="text-red-600">{result.error} ({result.longUrl})</div>
                    ) : (
                        <table className="min-w-full border">
                            <thead>
                                <tr>
                                    <th className="border px-2">Short URL</th>
                                    <th className="border px-2">Original URL</th>
                                    <th className="border px-2">Expiry</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border px-2">
                                        <a
                                            href={`/${result.shortcode}`}
                                            className="text-blue-600 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {window.location.origin}/{result.shortcode}
                                        </a>
                                    </td>
                                    <td className="border px-2">{result.longUrl}</td>
                                    <td className="border px-2">{new Date(result.expiryDate).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default URLShortener;
