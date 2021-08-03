export function handleErrorMessagesFactory(setter:  React.Dispatch<React.SetStateAction<string>>) {
    return  function handleErrorMessages(errorOptions: {err?: Error, customMessage?: string}) {
        const { err, customMessage } = errorOptions;
        if (err) {
            setter(err.message);
            console.log(err);
        } else if (customMessage) {
            setter(customMessage);
        }
    }

}

