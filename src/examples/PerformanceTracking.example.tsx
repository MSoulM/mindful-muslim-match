import { useState } from 'react';
import { usePerformanceMonitor, useRenderTracking, useApiTracking } from '@/hooks/usePerformanceMonitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Example 1: Component render tracking
const TrackedComponent = ({ name }: { name: string }) => {
  useRenderTracking(`TrackedComponent-${name}`);
  const [count, setCount] = useState(0);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Tracked Component: {name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">Render count: {count}</p>
        <Button onClick={() => setCount(c => c + 1)} size="sm">
          Re-render (tracked)
        </Button>
      </CardContent>
    </Card>
  );
};

// Example 2: API call tracking
const ApiCallExample = () => {
  const { trackApiCall } = useApiTracking();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleApiCall = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const data = await trackApiCall(
        '/api/example',
        async () => {
          // Simulate API call with random delay
          await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
          return { message: 'Success!' };
        },
        { userId: '123', endpoint: 'example' }
      );
      setResult(data.message);
    } catch (error) {
      setResult('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">API Call Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleApiCall} disabled={loading} size="sm" className="mb-2">
          {loading ? 'Loading...' : 'Make Tracked API Call'}
        </Button>
        {result && <p className="text-xs text-muted-foreground">{result}</p>}
      </CardContent>
    </Card>
  );
};

// Example 3: Performance report
const PerformanceReport = () => {
  const { getReport, clear } = usePerformanceMonitor();
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<string>('');

  const handleShowReport = () => {
    const report = getReport();
    setReportData(JSON.stringify(report, null, 2));
    setShowReport(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Performance Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-2">
          <Button onClick={handleShowReport} size="sm" variant="outline">
            Generate Report
          </Button>
          <Button onClick={clear} size="sm" variant="outline">
            Clear Metrics
          </Button>
        </div>
        
        {showReport && (
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
            {reportData}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

// Main example component
export const PerformanceTrackingExample = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Performance Tracking Examples</h1>
      
      <div className="space-y-4">
        <TrackedComponent name="A" />
        <TrackedComponent name="B" />
        <ApiCallExample />
        <PerformanceReport />
      </div>

      <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
        <p className="font-semibold mb-2">Usage Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use useRenderTracking() to automatically track component render times</li>
          <li>Wrap API calls with trackApiCall() to measure response times</li>
          <li>View real-time stats in the Performance Monitor (bottom-right corner)</li>
          <li>Generate reports to see p95/p99 percentiles and identify bottlenecks</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceTrackingExample;
