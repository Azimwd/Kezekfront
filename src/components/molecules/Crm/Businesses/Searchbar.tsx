import {
    Search
} from 'lucide-react';

import Icon
    from '../../../atoms/Icon';

import Input
    from '../../../atoms/Input';


export default function Searchbar() {
    return (
        <form
            className="
                flex
                w-full
                min-w-0
                items-center
                gap-2
                rounded-xl
                border
                border-[#c7c4d8]
                bg-[#eff4ff]
                px-3
                py-3
            "
        >
            <Icon
                icon={Search}
                size={20}
                className="shrink-0 text-[#222222]"
            />

            <Input
                type="text"
                placeholder="Поиск по системе..."
                className="min-w-0 flex-1"
            />
        </form>
    );
}