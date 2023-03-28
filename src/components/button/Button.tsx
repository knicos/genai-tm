import MButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const Button = styled(MButton)({
    textTransform: 'none',
});

export const VerticalButton = styled(MButton)({
    flexDirection: 'column',
    padding: '5px 8px',
    '& .MuiButton-startIcon': {
        margin: '0',
    },
    textTransform: 'none',
});
