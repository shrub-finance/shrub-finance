import React from 'react'
import ReactGA from 'react-ga'
export default function useReactGATracker(category = "Event category") {
    const trackEvent = (action = "action", label = "label") => {
        ReactGA.event(
            { category, action, label }
        )
    }
  return trackEvent;
}
