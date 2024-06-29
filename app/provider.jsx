import { NextUIProvider } from "@nextui-org/system";

export default function Provider({children}) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
}