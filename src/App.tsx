import { useEffect, useState } from 'react';

import { Home } from './pages/Home';
import { Historia } from './pages/Historia';
import { Colecoes } from './pages/Colecoes';
import { Admin } from './pages/Admin';
import { PlaylistWelcome } from './components/PlaylistWelcome';
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

  let page;

  if (path === '/historia') {
    page = <Historia />;
  } else if (path === '/colecoes') {
    page = <Colecoes />;
  } else if (path === '/admin') {
    page = <Admin />;
  } else {
    page = <Home />;
  }

  return (
    <>
      {page}

      {path !== '/admin' && <PlaylistWelcome />}
    </>
  );
}