import MButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { Button as BButton } from '@knicos/genai-base';

export const Button = BButton;

export const VerticalButton = styled(MButton)({
    flexDirection: 'column',
    padding: '5px 8px',
    '& .MuiButton-startIcon': {
        margin: '0',
    },
    textTransform: 'none',
});
