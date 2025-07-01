
import { Header } from '@/components/layout/Header';
import ChromeExtensionDemo from '@/components/ChromeExtensionDemo';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ChromeExtensionDemo />
      </main>
    </div>
  );
};

export default Index;
