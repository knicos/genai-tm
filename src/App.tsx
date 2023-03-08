import React from 'react';
import logo from './logo.svg';
import './App.css';
import { TeachableMachine } from './components/tfmodels/TeachableMachine';
import { RecoilRoot } from 'recoil';
import { Classifications } from './components/classifications/Classifications';
import { Trainer } from './components/trainer/Trainer';
import { Preview } from './components/preview/Preview';

function App() {
  return (
    <RecoilRoot>
        <TeachableMachine />
        <div className="App">
            <Classifications />
            <Trainer />
            <Preview />
        </div>
    </RecoilRoot>
  );
}

export default App;
