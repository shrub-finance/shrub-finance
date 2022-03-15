import ReactGA from 'react-ga'
export function trackEvent(eventOption: { action: string, label: string }) {
    const { action, label } = eventOption;
    if (label.trim().length !== 0) {
        ReactGA.event({
            category: 'Clicked',
            action: action,
            label: label
        });
    }
    else {
        ReactGA.event({
            category: 'Logo Clicked',
            action: action,
            label: label
        });
    }

}
