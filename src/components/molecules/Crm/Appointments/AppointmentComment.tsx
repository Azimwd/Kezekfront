import {
    MessageSquareText
} from 'lucide-react';

import Icon from '../../../atoms/Icon';
import Typography from '../../../atoms/Typography';

interface AppointmentCommentProps {
    comment: string | null;
}

export default function AppointmentComment({
    comment
}: AppointmentCommentProps) {
    const hasComment = Boolean(comment?.trim());

    return (
        <div className="w-full rounded-2xl border border-[#EAECF0] bg-white p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF]">
                    <Icon
                        icon={MessageSquareText}
                        size={19}
                        className="text-[#4F46E5]"
                    />
                </div>

                <div>
                    <Typography
                        text="Комментарий клиента"
                        className="text-base font-semibold text-[#111827]"
                    />

                    <Typography
                        text="Комментарий, оставленный при записи"
                        className="mt-0.5 text-sm text-slate-500"
                    />
                </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#F8FAFC] px-4 py-4">
                <Typography
                    text={
                        hasComment
                            ? comment!
                            : 'Комментарий отсутствует'
                    }
                    className={
                        hasComment
                            ? 'whitespace-pre-wrap text-sm leading-6 text-[#111827]'
                            : 'text-sm text-slate-400'
                    }
                />
            </div>
        </div>
    );
}