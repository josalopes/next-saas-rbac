

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-xs">{children}</div>
        
      </div>
  );
}
