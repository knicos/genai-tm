import { TeachableMobileNet } from "@teachablemachine/image";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { tfModel } from "../../state";
import { Webcam } from "../webcam/Webcam";
import { Widget } from "../widget/Widget";
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface IPrediction {
    className: string;
    probability: number;
}

interface Props {
    model?: TeachableMobileNet;
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }

export function Preview({model}: Props) {
    const [lastPrediction, setLastPrediction] = useState<IPrediction[]>([])

    const doPrediction = async (image: HTMLCanvasElement) => {
        if (model) {
            const prediction = await model.predict(image);
            console.log(prediction);
            setLastPrediction(prediction);
        }
    }

    return <Widget title="Machine">
        {model &&
            <div>
                <Webcam capture={!!model} interval={200} onCapture={doPrediction}/>
                {lastPrediction.map((p) => <LinearProgressWithLabel value={p.probability * 100}/>)}
            </div>
        }
        {!model &&
            <p>You must train your machine first.</p>
        }
    </Widget>
}
