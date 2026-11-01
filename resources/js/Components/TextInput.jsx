import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded border border-pink-600/30 bg-black/80 text-white placeholder-gray-500 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ' +
                className
            }
            ref={input}
        />
    );
});
