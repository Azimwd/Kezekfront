interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}


export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    disabled = false
}: PaginationProps) {

    /*
     * Если всего одна страница,
     * кнопки пагинации не нужны.
     */
    if (totalPages <= 1) {
        return null;
    }


    const pages =
        Array.from(
            {
                length: totalPages
            },
            (
                _,
                index
            ) =>
                index + 1
        );


    const handlePrevious = () => {
        if (
            disabled ||
            currentPage <= 1
        ) {
            return;
        }


        onPageChange(
            currentPage - 1
        );
    };


    const handleNext = () => {
        if (
            disabled ||
            currentPage >= totalPages
        ) {
            return;
        }


        onPageChange(
            currentPage + 1
        );
    };


    return (
        <div className="flex items-center gap-1">

            {/* PREVIOUS */}

            <button
                type="button"
                onClick={
                    handlePrevious
                }
                disabled={
                    disabled ||
                    currentPage <= 1
                }
                className="
                    h-9
                    px-4
                    rounded-lg
                    border
                    border-[#c7c4d8]
                    bg-white
                    text-sm
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                "
            >
                Пред.
            </button>


            {/* PAGE NUMBERS */}

            {pages.map(
                (
                    pageNumber
                ) => (
                    <button
                        key={
                            pageNumber
                        }
                        type="button"
                        onClick={() =>
                            onPageChange(
                                pageNumber
                            )
                        }
                        disabled={
                            disabled
                        }
                        className={`
                            h-9
                            min-w-9
                            px-3
                            rounded-lg
                            border
                            text-sm
                            font-medium
                            transition

                            ${
                                pageNumber ===
                                currentPage
                                    ? 'border-[#4031d0] bg-[#4031d0] text-white'
                                    : 'border-[#c7c4d8] bg-white text-slate-600 hover:bg-slate-50'
                            }

                            ${
                                disabled
                                    ? 'opacity-60 cursor-not-allowed'
                                    : ''
                            }
                        `}
                    >
                        {
                            pageNumber
                        }
                    </button>
                )
            )}


            {/* NEXT */}

            <button
                type="button"
                onClick={
                    handleNext
                }
                disabled={
                    disabled ||
                    currentPage >=
                        totalPages
                }
                className="
                    h-9
                    px-4
                    rounded-lg
                    border
                    border-[#c7c4d8]
                    bg-white
                    text-sm
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                "
            >
                След.
            </button>

        </div>
    );
}