import { Toaster } from '@/components/ui/sonner';
import KnowledgeHub from '@/sections/KnowledgeHub';
import './App.css';

export default function App() {
  return (
    <>
      <KnowledgeHub />
      <Toaster position="top-center" richColors />
    </>
  );
}
