import {
  useEffect,
  useState,
} from 'react';

import { Home } from './pages/Home';
import { Historia } from './pages/Historia';
import { Colecoes } from './pages/Colecoes';
import { Admin } from './pages/Admin';
import { PlaylistWelcome } from './components/PlaylistWelcome';
import { Caderno } from './pages/Caderno';


export default function App() {
  const [path, setPath] = useState(
    `${window.location.pathname}${window.location.search}`
  );

  useEffect(() => {
    const handlePopState = () => {
      setPath(
        `${window.location.pathname}${window.location.search}`
      );
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

  const pathname =
    path.split('?')[0];

    let page;

  if (pathname === '/historia') {
    page = <Historia />;
  } else if (pathname === '/caderno') {
    page = <Caderno />;
  } else if (pathname === '/colecoes') {
    page = <Colecoes key={path} />;
  } else if (pathname === '/admin') {
    page = <Admin />;
  } else {
    page = <Home />;
  }

  return (
    <>
      {page}

      {pathname !== '/admin' && (
        <PlaylistWelcome />
      )}
    </>
  );
}