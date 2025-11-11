import { useState } from 'react';
import { RotateCw } from 'lucide-react';

const devices = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'iPad Mini', width: 768, height: 1024 },
];

export const DevicePreview = () => {
  const [selectedDevice, setSelectedDevice] = useState(devices[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  const width = orientation === 'portrait' ? selectedDevice.width : selectedDevice.height;
  const height = orientation === 'portrait' ? selectedDevice.height : selectedDevice.width;
  
  return (
    <div className="bg-neutral-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Device Preview</h1>
        
        <div className="mb-6 flex gap-4 flex-wrap items-center">
          {devices.map(device => (
            <button
              key={device.name}
              onClick={() => setSelectedDevice(device)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedDevice.name === device.name 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-white text-foreground hover:bg-neutral-200'
              }`}
            >
              {device.name}
            </button>
          ))}
          
          <button
            onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
            className="px-4 py-2 bg-white rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Rotate
          </button>
          
          <div className="ml-auto text-sm text-muted-foreground">
            {width} × {height}px
          </div>
        </div>
        
        <div className="flex justify-center">
          <div
            className="bg-black rounded-[40px] p-4 shadow-2xl transition-all duration-500"
            style={{ width: width + 40, height: height + 40 }}
          >
            <iframe
              src="/"
              className="w-full h-full bg-white rounded-[24px]"
              style={{ width, height }}
              title="Device Preview"
            />
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Preview how your app looks on different devices</p>
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
