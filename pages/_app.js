import * as React from 'react';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />
  }