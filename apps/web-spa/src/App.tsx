// apps/web-spa/src/App.tsx
import { Feed } from './components/Feed';

export function App() {
  return (
    <main className="feed">
      <h1 className="feed-title">인스타그램</h1>
      <Feed />
    </main>
  );
}
