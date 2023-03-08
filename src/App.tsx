import React from 'react';
import logo from './logo.svg';
import './App.css';
import { TeachableMachine } from './components/tfmodels/TeachableMachine';
import { RecoilRoot } from 'recoil';
import { Classifications } from './components/classifications/Classifications';

function App() {
  return (
    <RecoilRoot>
        <TeachableMachine />
        <div className="App">
            <Classifications />
        </div>
    </RecoilRoot>
  );
}

export default App;
