import React, { useState } from 'react';
import {
  useGetTestsQuery,
  useGetMeQuery,
  useAppSelector,
} from '../src/store/hooks';
import { CefrLevel } from '../src/api/types';

/**
 * API Test Page
 * Backend integratsiyasini test qilish uchun
 */
const ApiTest: React.FC = () => {
  const [testLevel, setTestLevel] = useState<CefrLevel | undefined>(undefined);
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // Get Tests API test
  const {
    data: testsData,
    isLoading: testsLoading,
    error: testsError,
    refetch: refetchTests,
  } = useGetTestsQuery(
    {
      level: testLevel,
      page: 0,
      size: 5,
    },
    {
      skip: false, // Always run, even without auth
    }
  );

  // Get Me API test (requires auth)
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>🧪 API Integration Test</h1>

      {/* Status Section */}
      <div
        style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
        }}>
        <h2>📊 Status</h2>
        <p>
          <strong>Redux Store:</strong> ✅ Working
        </p>
        <p>
          <strong>Authentication:</strong> {isAuthenticated ? '✅ Logged in' : '❌ Not logged in'}
        </p>
        <p>
          <strong>Token:</strong> {token ? `✅ ${token.substring(0, 20)}...` : '❌ No token'}
        </p>
        <p>
          <strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}
        </p>
      </div>

      {/* User Info Test */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
        }}>
        <h2>👤 User API Test (GET /users/me)</h2>

        {!isAuthenticated && (
          <div
            style={{
              background: '#fff3cd',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '15px',
            }}>
            ⚠️ This endpoint requires authentication. Please login first.
          </div>
        )}

        {isAuthenticated && (
          <>
            <button
              onClick={() => refetchUser()}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '15px',
              }}>
              Test GET /users/me
            </button>

            {userLoading && <p>⏳ Loading user data...</p>}

            {userError && (
              <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '4px' }}>
                ❌ Error: {JSON.stringify(userError, null, 2)}
              </div>
            )}

            {userData && (
              <div style={{ background: '#d4edda', padding: '15px', borderRadius: '4px' }}>
                <p>✅ Success!</p>
                <pre style={{ overflow: 'auto' }}>{JSON.stringify(userData, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tests API Test */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
        }}>
        <h2>📝 Tests API Test (GET /tests)</h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>
            <strong>Filter by CEFR Level:</strong>
          </label>
          <select
            value={testLevel || ''}
            onChange={(e) => setTestLevel((e.target.value as CefrLevel) || undefined)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              marginRight: '10px',
            }}>
            <option value="">All Levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>

          <button
            onClick={() => refetchTests()}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
            Refresh Tests
          </button>
        </div>

        {testsLoading && <p>⏳ Loading tests...</p>}

        {testsError && (
          <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '4px' }}>
            <p>❌ Error Details:</p>
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(
                {
                  message: 'status' in testsError ? testsError.status : 'Network Error',
                  data: 'data' in testsError ? testsError.data : 'No data',
                  error: testsError,
                },
                null,
                2
              )}
            </pre>
            <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd' }}>
              <p>
                <strong>Possible Issues:</strong>
              </p>
              <ul>
                <li>Backend server is not running on port 8080</li>
                <li>CORS is not configured properly</li>
                <li>Backend URL is incorrect in .env.local</li>
              </ul>
              <p>
                <strong>Backend URL:</strong>{' '}
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}
              </p>
            </div>
          </div>
        )}

        {testsData && (
          <div style={{ background: '#d4edda', padding: '15px', borderRadius: '4px' }}>
            <p>
              ✅ Success! Found {testsData.totalCount} tests (Showing {testsData.items.length})
            </p>

            <div style={{ marginTop: '15px' }}>
              <h3>Response Data:</h3>
              <pre
                style={{
                  overflow: 'auto',
                  background: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '4px',
                }}>
                {JSON.stringify(testsData, null, 2)}
              </pre>
            </div>

            {testsData.items.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3>Tests Preview:</h3>
                {testsData.items.map((test) => (
                  <div
                    key={test.id}
                    style={{
                      background: 'white',
                      padding: '15px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{test.title}</h4>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Level:</strong> {test.cefrLevel} | <strong>Sections:</strong>{' '}
                      {test.sectionCount}
                    </p>
                    {test.description && (
                      <p style={{ margin: '5px 0', color: '#666' }}>{test.description}</p>
                    )}
                    {test.timeLimitMinutes && (
                      <p style={{ margin: '5px 0' }}>
                        ⏱️ Time Limit: {test.timeLimitMinutes} minutes
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          background: '#e9ecef',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
        <p>
          <strong>📚 Documentation:</strong>
        </p>
        <p>Check API_INTEGRATION.md for complete usage guide</p>
        <p>Check INTEGRATION_SUMMARY.md for setup instructions</p>
      </div>
    </div>
  );
};

export default ApiTest;
