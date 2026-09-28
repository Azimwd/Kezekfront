// import {
//     useCallback,
//     useEffect,
//     useMemo,
//     useState
// } from 'react';

// import {
//     createPortal
// } from 'react-dom';

// import {
//     useLocation,
//     useNavigate
// } from 'react-router-dom';

// import {
//     ChevronLeft,
//     ChevronRight,
//     X
// } from 'lucide-react';


// interface TourStep {
//     id: string;
//     route: string;
//     target: string;
//     title: string;
//     description: string;
// }


// interface RectState {
//     top: number;
//     left: number;
//     width: number;
//     height: number;
// }


// const TOUR_STORAGE_KEY =
//     'kezek_business_owner_tour_completed';


// const steps: TourStep[] = [
//     {
//         id: 'business',
//         route: '/crm/my-businesses',
//         target: '[data-tour="create-business"]',
//         title: 'Создайте бизнес',
//         description:
//             'Начните с создания бизнеса. Укажите название, город и адрес.'
//     },
//     {
//         id: 'service',
//         route: '/crm/services',
//         target: '[data-tour="create-service"]',
//         title: 'Создайте первую услугу',
//         description:
//             'Добавьте услугу, укажите цену и длительность.'
//     },
//     {
//         id: 'staff',
//         route: '/crm/staff',
//         target: '[data-tour="create-staff"]',
//         title: 'Добавьте сотрудника',
//         description:
//             'Добавьте мастера или другого сотрудника вашего бизнеса.'
//     },
//     {
//         id: 'assign-service',
//         route: '/crm/staff',
//         target: '[data-tour="assign-service"]',
//         title: 'Назначьте услуги',
//         description:
//             'Выберите, какие услуги может выполнять сотрудник.'
//     },
//     {
//         id: 'schedule',
//         route: '/crm/schedule',
//         target: '[data-tour="schedule"]',
//         title: 'Настройте график',
//         description:
//             'Укажите рабочие дни и часы сотрудника.'
//     },
//     {
//         id: 'settings',
//         route: '/crm/settings',
//         target: '[data-tour="booking-settings"]',
//         title: 'Настройте онлайн-запись',
//         description:
//             'Здесь находятся параметры записи, отмены и предоплаты.'
//     },
//     {
//         id: 'appointment',
//         route: '/crm/appointments',
//         target: '[data-tour="create-appointment"]',
//         title: 'Создайте первую запись',
//         description:
//             'Создайте запись клиента и проверьте, как работает CRM.'
//     }
// ];


// const waitForElement = (
//     selector: string,
//     timeout = 5000
// ): Promise<HTMLElement | null> => {

//     return new Promise(
//         resolve => {

//             const existing =
//                 document.querySelector<HTMLElement>(
//                     selector
//                 );

//             if (existing) {
//                 resolve(existing);
//                 return;
//             }

//             const startedAt =
//                 Date.now();

//             const interval =
//                 window.setInterval(
//                     () => {

//                         const element =
//                             document.querySelector<HTMLElement>(
//                                 selector
//                             );

//                         if (element) {
//                             window.clearInterval(
//                                 interval
//                             );

//                             resolve(
//                                 element
//                             );

//                             return;
//                         }

//                         if (
//                             Date.now() -
//                             startedAt >=
//                             timeout
//                         ) {
//                             window.clearInterval(
//                                 interval
//                             );

//                             resolve(
//                                 null
//                             );
//                         }

//                     },
//                     100
//                 );
//         }
//     );
// };


// export default function CrmTour() {

//     const navigate =
//         useNavigate();

//     const location =
//         useLocation();

//     const [
//         isRunning,
//         setIsRunning
//     ] = useState(
//         false
//     );

//     const [
//         stepIndex,
//         setStepIndex
//     ] = useState(
//         0
//     );

//     const [
//         rect,
//         setRect
//     ] = useState<RectState | null>(
//         null
//     );

//     const [
//         targetElement,
//         setTargetElement
//     ] = useState<HTMLElement | null>(
//         null
//     );


//     const step =
//         steps[
//             stepIndex
//         ];


//     const completed =
//         useMemo(
//             () =>
//                 localStorage.getItem(
//                     TOUR_STORAGE_KEY
//                 ) === 'true',
//             []
//         );


//     useEffect(
//         () => {

//             if (
//                 completed
//             ) {
//                 return;
//             }

//             setIsRunning(
//                 true
//             );

//         },
//         [
//             completed
//         ]
//     );


//     const updatePosition =
//         useCallback(
//             () => {

//                 if (
//                     !targetElement
//                 ) {
//                     return;
//                 }

//                 const targetRect =
//                     targetElement
//                         .getBoundingClientRect();

//                 setRect({
//                     top:
//                         targetRect.top,
//                     left:
//                         targetRect.left,
//                     width:
//                         targetRect.width,
//                     height:
//                         targetRect.height
//                 });

//             },
//             [
//                 targetElement
//             ]
//         );


//     const findTarget =
//         useCallback(
//             async () => {

//                 if (
//                     !isRunning ||
//                     !step
//                 ) {
//                     return;
//                 }

//                 if (
//                     location.pathname !==
//                     step.route
//                 ) {
//                     navigate(
//                         step.route
//                     );

//                     return;
//                 }

//                 const element =
//                     await waitForElement(
//                         step.target
//                     );

//                 if (
//                     !element
//                 ) {
//                     setRect(
//                         null
//                     );

//                     setTargetElement(
//                         null
//                     );

//                     return;
//                 }

//                 element.scrollIntoView({
//                     behavior:
//                         'smooth',
//                     block:
//                         'center'
//                 });

//                 setTargetElement(
//                     element
//                 );

//             },
//             [
//                 isRunning,
//                 step,
//                 location.pathname,
//                 navigate
//             ]
//         );


//     useEffect(
//         () => {

//             findTarget();

//         },
//         [
//             findTarget
//         ]
//     );


//     useEffect(
//         () => {

//             updatePosition();

//             window.addEventListener(
//                 'resize',
//                 updatePosition
//             );

//             window.addEventListener(
//                 'scroll',
//                 updatePosition,
//                 true
//             );

//             return () => {

//                 window.removeEventListener(
//                     'resize',
//                     updatePosition
//                 );

//                 window.removeEventListener(
//                     'scroll',
//                     updatePosition,
//                     true
//                 );
//             };

//         },
//         [
//             updatePosition
//         ]
//     );


//     useEffect(
//         () => {

//             if (
//                 !targetElement
//             ) {
//                 return;
//             }

//             const timeout =
//                 window.setTimeout(
//                     () => {
//                         updatePosition();
//                     },
//                     350
//                 );

//             return () =>
//                 window.clearTimeout(
//                     timeout
//                 );

//         },
//         [
//             targetElement,
//             location.pathname,
//             updatePosition
//         ]
//     );


//     const handleNext =
//         () => {

//             if (
//                 stepIndex >=
//                 steps.length - 1
//             ) {

//                 localStorage.setItem(
//                     TOUR_STORAGE_KEY,
//                     'true'
//                 );

//                 setIsRunning(
//                     false
//                 );

//                 setRect(
//                     null
//                 );

//                 return;
//             }

//             setTargetElement(
//                 null
//             );

//             setRect(
//                 null
//             );

//             setStepIndex(
//                 previous =>
//                     previous + 1
//             );
//         };


//     const handleBack =
//         () => {

//             if (
//                 stepIndex ===
//                 0
//             ) {
//                 return;
//             }

//             setTargetElement(
//                 null
//             );

//             setRect(
//                 null
//             );

//             setStepIndex(
//                 previous =>
//                     previous - 1
//             );
//         };


//     const handleClose =
//         () => {

//             localStorage.setItem(
//                 TOUR_STORAGE_KEY,
//                 'true'
//             );

//             setIsRunning(
//                 false
//             );

//             setRect(
//                 null
//             );
//         };


//     if (
//         !isRunning ||
//         !step ||
//         !rect
//     ) {
//         return null;
//     }


//     const padding =
//         8;

//     const spotlight = {
//         top:
//             Math.max(
//                 rect.top - padding,
//                 0
//             ),

//         left:
//             Math.max(
//                 rect.left - padding,
//                 0
//             ),

//         width:
//             rect.width +
//             padding * 2,

//         height:
//             rect.height +
//             padding * 2
//     };


//     const tooltipWidth =
//         340;


//     const spaceBelow =
//         window.innerHeight -
//         (
//             spotlight.top +
//             spotlight.height
//         );


//     const showAbove =
//         spaceBelow <
//         230;


//     const tooltipTop =
//         showAbove
//             ? Math.max(
//                 spotlight.top -
//                 210,
//                 16
//             )
//             : Math.min(
//                 spotlight.top +
//                 spotlight.height +
//                 16,
//                 window.innerHeight -
//                 220
//             );


//     const tooltipLeft =
//         Math.min(
//             Math.max(
//                 spotlight.left,
//                 16
//             ),
//             window.innerWidth -
//             tooltipWidth -
//             16
//         );


//     return createPortal(
//         <>
//             <div
//                 className="
//                     fixed
//                     left-0
//                     right-0
//                     top-0
//                     z-[9998]
//                     bg-black/65
//                 "
//                 style={{
//                     height:
//                         spotlight.top
//                 }}
//             />

//             <div
//                 className="
//                     fixed
//                     bottom-0
//                     left-0
//                     right-0
//                     z-[9998]
//                     bg-black/65
//                 "
//                 style={{
//                     top:
//                         spotlight.top +
//                         spotlight.height
//                 }}
//             />

//             <div
//                 className="
//                     fixed
//                     left-0
//                     z-[9998]
//                     bg-black/65
//                 "
//                 style={{
//                     top:
//                         spotlight.top,
//                     width:
//                         spotlight.left,
//                     height:
//                         spotlight.height
//                 }}
//             />

//             <div
//                 className="
//                     fixed
//                     right-0
//                     z-[9998]
//                     bg-black/65
//                 "
//                 style={{
//                     top:
//                         spotlight.top,
//                     left:
//                         spotlight.left +
//                         spotlight.width,
//                     height:
//                         spotlight.height
//                 }}
//             />

//             <div
//                 className="
//                     pointer-events-none
//                     fixed
//                     z-[9999]
//                     rounded-xl
//                     border-2
//                     border-[#818CF8]
//                     shadow-[0_0_0_4px_rgba(99,102,241,0.18),0_0_28px_rgba(99,102,241,0.7)]
//                 "
//                 style={{
//                     top:
//                         spotlight.top,
//                     left:
//                         spotlight.left,
//                     width:
//                         spotlight.width,
//                     height:
//                         spotlight.height
//                 }}
//             >
//                 <span
//                     className="
//                         absolute
//                         -right-2
//                         -top-2
//                         h-4
//                         w-4
//                         animate-ping
//                         rounded-full
//                         bg-[#6366F1]
//                     "
//                 />

//                 <span
//                     className="
//                         absolute
//                         -right-2
//                         -top-2
//                         h-4
//                         w-4
//                         rounded-full
//                         bg-[#6366F1]
//                     "
//                 />
//             </div>

//             <div
//                 className="
//                     fixed
//                     z-[10000]
//                     w-[340px]
//                     max-w-[calc(100vw-32px)]
//                     rounded-2xl
//                     border
//                     border-[#D9DDEC]
//                     bg-white
//                     p-5
//                     shadow-[0_20px_60px_rgba(15,23,42,0.35)]
//                 "
//                 style={{
//                     top:
//                         tooltipTop,
//                     left:
//                         tooltipLeft
//                 }}
//             >
//                 <div
//                     className="
//                         flex
//                         items-start
//                         justify-between
//                         gap-4
//                     "
//                 >
//                     <div>
//                         <div
//                             className="
//                                 text-[11px]
//                                 font-semibold
//                                 uppercase
//                                 tracking-wide
//                                 text-[#6366F1]
//                             "
//                         >
//                             Шаг {
//                                 stepIndex + 1
//                             } из {
//                                 steps.length
//                             }
//                         </div>

//                         <h3
//                             className="
//                                 mt-1
//                                 text-[17px]
//                                 font-bold
//                                 text-[#101828]
//                             "
//                         >
//                             {
//                                 step.title
//                             }
//                         </h3>
//                     </div>

//                     <button
//                         type="button"
//                         onClick={
//                             handleClose
//                         }
//                         className="
//                             flex
//                             h-8
//                             w-8
//                             shrink-0
//                             items-center
//                             justify-center
//                             rounded-lg
//                             text-[#98A2B3]
//                             transition
//                             hover:bg-[#F2F4F7]
//                             hover:text-[#344054]
//                         "
//                     >
//                         <X
//                             size={17}
//                         />
//                     </button>
//                 </div>

//                 <p
//                     className="
//                         mt-3
//                         text-[13px]
//                         leading-5
//                         text-[#667085]
//                     "
//                 >
//                     {
//                         step.description
//                     }
//                 </p>

//                 <div
//                     className="
//                         mt-5
//                         flex
//                         items-center
//                         justify-between
//                         gap-3
//                     "
//                 >
//                     <button
//                         type="button"
//                         onClick={
//                             handleBack
//                         }
//                         disabled={
//                             stepIndex ===
//                             0
//                         }
//                         className="
//                             inline-flex
//                             h-10
//                             items-center
//                             gap-1
//                             rounded-xl
//                             px-3
//                             text-[12px]
//                             font-semibold
//                             text-[#667085]
//                             transition
//                             hover:bg-[#F2F4F7]
//                             disabled:cursor-not-allowed
//                             disabled:opacity-30
//                         "
//                     >
//                         <ChevronLeft
//                             size={15}
//                         />

//                         Назад
//                     </button>

//                     <button
//                         type="button"
//                         onClick={
//                             handleNext
//                         }
//                         className="
//                             inline-flex
//                             h-10
//                             items-center
//                             gap-1.5
//                             rounded-xl
//                             bg-[#4F46E5]
//                             px-4
//                             text-[12px]
//                             font-semibold
//                             text-white
//                             transition
//                             hover:bg-[#4338CA]
//                         "
//                     >
//                         {
//                             stepIndex ===
//                             steps.length - 1
//                                 ? 'Завершить'
//                                 : 'Далее'
//                         }

//                         {
//                             stepIndex <
//                             steps.length - 1 && (
//                                 <ChevronRight
//                                     size={15}
//                                 />
//                             )
//                         }
//                     </button>
//                 </div>

//                 <div
//                     className="
//                         mt-4
//                         flex
//                         gap-1.5
//                     "
//                 >
//                     {
//                         steps.map(
//                             (
//                                 item,
//                                 index
//                             ) => (
//                                 <div
//                                     key={
//                                         item.id
//                                     }
//                                     className={`
//                                         h-1.5
//                                         flex-1
//                                         rounded-full

//                                         ${
//                                             index <=
//                                             stepIndex
//                                                 ? 'bg-[#6366F1]'
//                                                 : 'bg-[#EAECF0]'
//                                         }
//                                     `}
//                                 />
//                             )
//                         )
//                     }
//                 </div>
//             </div>
//         </>,
//         document.body
//     );
// }