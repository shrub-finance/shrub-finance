import ReactGA from "react-ga"

export default function trackEvent(eventOption:{ categoryText?:string, action:string, label:string }){
  const { action, label, categoryText = "crypto" } = eventOption;
    ReactGA.event({
      category:categoryText,
      action:action,
      label:label
    });
}
