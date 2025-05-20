'use client';
import CodeExplainer from "./components/CodeExplainer";
// import DetectAndCodeExplainer from "./components/DetectAndCodeExplainer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white py-10 px-4">
      <CodeExplainer />      
        {/* <DetectAndCodeExplainer /> */}
    </main>
  );
}
