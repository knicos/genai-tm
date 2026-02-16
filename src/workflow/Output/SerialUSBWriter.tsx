import { serialWriterInstance } from '@genaitm/state';
import UsbIcon from '@mui/icons-material/Usb';
import { useAtom } from 'jotai';
import { useEffect} from 'react';
interface Props extends React.PropsWithChildren {
    predicted: number;
    showIcon: boolean;
    show: boolean;
}
export default function SeriaUSBWriter({ predicted, showIcon, show }: Props) {
    const [serialUSBPort] = useAtom(serialWriterInstance);
    const predictedClassNumber = predicted+1
    // Send predicted index as class changes. Sends class number to serial device class 1 -> "1" class 2 -> "2" etc
    // Currently templates for pi pico, arduino. Micro bit? , esp 32?
    useEffect(() => {
        const sendClass = async () => {
            if (serialUSBPort != null) {
                const encoder = new TextEncoder();
                try{
                await serialUSBPort.write(encoder.encode(predictedClassNumber.toString()));}
                catch(e){
                    console.error(e);
                }
                
            }
        };
        sendClass();
    }, [predicted]);
    return showIcon && show ? (
        <UsbIcon
            data-testid="serial-output-icon"
            color="primary"
            sx={{ fontSize: 128 }}
        />
    ) : (
        <div data-testid="serial-output"></div>
    );
}