export function handleErrorMessagesFactory(
  setter: React.Dispatch<React.SetStateAction<string>>
) {
  return function handleErrorMessages(errorOptions: {
    err?: Error;
    customMessage?: string;
  }) {
    const { err, customMessage } = errorOptions;
    if (err) {
      // @ts-ignore
      if (err.data && err.data.message) {
        if (
          // @ts-ignore
          err.data.message.includes("execution reverted:")
        ) {
          // @ts-ignore
          setter(err.data.message.replace("execution reverted:", ""));
        }
        if (
          // @ts-ignore
          err.data.message.includes("Insufficient ticket balance to redeem")
        ) {
          setter(
            // @ts-ignore
            (err.data.message = "Insufficient ticket balance to redeem")
          );
        } else {
          // @ts-ignore
          setter(err.data.message);
        }
      } else {
        setter(err.message);
      }
      console.log(err);
    } else if (customMessage) {
      setter(customMessage);
    }
  };
}
