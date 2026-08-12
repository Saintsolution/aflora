import { useEffect, useState } from 'react';

import { Home } from './pages/Home';
import { Historia } from './pages/Historia';
import { Colecoes } from './pages/Colecoes';
import { Admin } from './pages/Admin';

export default function App() {
  const [path, setPath] = useState(
    window.location.pathname
  );

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  if (path === '/historia') {
    return <Historia />;
  }

  if (path === '/colecoes') {
    return <Colecoes />;
  }

  if (path === '/admin') {
    return <Admin />;
  }

  return <Home />;
}