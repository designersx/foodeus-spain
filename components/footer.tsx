"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/language-context"

export default function Footer() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <footer className="fixed-bottom bg-light border-top">
      <div className="container">
        <div className="row text-center py-3">
          <div className="col-4">
            <Link
              href="/"
              className={`text-decoration-none d-flex flex-column align-items-center ${pathname === "/" ? "text-primary" : "text-secondary"
                }`}
            >

              <svg width="26" height="17" viewBox="0 0 26 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M5.38999 0.000125784C5.31235 -0.00175672 5.23521 0.0175079 5.16307 0.0567917C5.09094 0.0960755 5.02526 0.154599 4.96986 0.228934C4.91446 0.30327 4.87046 0.391928 4.84043 0.489744C4.81039 0.58756 4.79492 0.692569 4.79492 0.79864C4.79492 0.904711 4.81039 1.00972 4.84043 1.10754C4.87046 1.20535 4.91446 1.29401 4.96986 1.36835C5.02526 1.44268 5.09094 1.5012 5.16307 1.54049C5.23521 1.57977 5.31235 1.59904 5.38999 1.59715H24.9065C24.9842 1.59904 25.0613 1.57977 25.1334 1.54049C25.2056 1.5012 25.2713 1.44268 25.3266 1.36835C25.382 1.29401 25.426 1.20535 25.4561 1.10754C25.4861 1.00972 25.5016 0.904711 25.5016 0.79864C25.5016 0.692569 25.4861 0.58756 25.4561 0.489744C25.426 0.391928 25.382 0.30327 25.3266 0.228934C25.2713 0.154599 25.2056 0.0960755 25.1334 0.0567917C25.0613 0.0175079 24.9842 -0.00175672 24.9065 0.000125784H5.38999Z" fill="#95757D" />
                <path fillRule="evenodd" clipRule="evenodd" d="M0.595072 0.000125784C0.517428 -0.00175672 0.440287 0.0175079 0.368152 0.0567917C0.296018 0.0960755 0.230335 0.154599 0.174938 0.228934C0.119542 0.30327 0.0755413 0.391928 0.0455054 0.489744C0.0154694 0.58756 0 0.692569 0 0.79864C0 0.904711 0.0154694 1.00972 0.0455054 1.10754C0.0755413 1.20535 0.119542 1.29401 0.174938 1.36835C0.230335 1.44268 0.296018 1.5012 0.368152 1.54049C0.440287 1.57977 0.517428 1.59904 0.595072 1.59715H2.90882C2.98646 1.59904 3.0636 1.57977 3.13574 1.54049C3.20787 1.5012 3.27355 1.44268 3.32895 1.36835C3.38435 1.29401 3.42835 1.20535 3.45838 1.10754C3.48842 1.00972 3.50389 0.904711 3.50389 0.79864C3.50389 0.692569 3.48842 0.58756 3.45838 0.489744C3.42835 0.391928 3.38435 0.30327 3.32895 0.228934C3.27355 0.154599 3.20787 0.0960755 3.13574 0.0567917C3.0636 0.0175079 2.98646 -0.00175672 2.90882 0.000125784H0.595072Z" fill="#95757D" />
                <path fillRule="evenodd" clipRule="evenodd" d="M5.39074 5.11147C5.3131 5.10945 5.23594 5.12859 5.16377 5.16775C5.0916 5.2069 5.02587 5.26529 4.9704 5.33953C4.91494 5.41376 4.87085 5.50236 4.84072 5.60012C4.8106 5.69787 4.79503 5.80285 4.79492 5.90891C4.79482 6.01498 4.81019 6.12002 4.84013 6.21788C4.87006 6.31575 4.91398 6.40448 4.9693 6.47891C5.02462 6.55335 5.09024 6.612 5.16233 6.65142C5.23443 6.69084 5.31155 6.71024 5.38919 6.7085L24.9058 6.74443C24.9834 6.74644 25.0606 6.72733 25.1328 6.68817C25.2049 6.64902 25.2707 6.59061 25.3261 6.51637C25.3816 6.44214 25.4257 6.35357 25.4558 6.25581C25.4859 6.15805 25.5015 6.05308 25.5016 5.94701C25.5017 5.84094 25.4864 5.73591 25.4564 5.63804C25.4265 5.54017 25.3826 5.45142 25.3272 5.37699C25.2719 5.30255 25.2063 5.24392 25.1342 5.2045C25.0621 5.16509 24.985 5.14569 24.9074 5.14742L5.39074 5.11147Z" fill="#95757D" />
                <path fillRule="evenodd" clipRule="evenodd" d="M0.595777 5.11147C0.518137 5.10946 0.440981 5.12861 0.368813 5.16777C0.296646 5.20693 0.230913 5.26533 0.175451 5.33957C0.119989 5.41381 0.0759098 5.5024 0.045786 5.60016C0.0156622 5.69793 9.75399e-05 5.80292 4.56978e-07 5.90899C-9.66259e-05 6.01505 0.0152759 6.12007 0.0452206 6.21793C0.0751653 6.3158 0.119082 6.40456 0.174408 6.47898C0.229734 6.55341 0.29536 6.61203 0.367455 6.65144C0.439551 6.69085 0.516671 6.71025 0.594315 6.7085L2.90797 6.7125C2.98561 6.71451 3.06276 6.6954 3.13493 6.65625C3.2071 6.61709 3.27284 6.55868 3.3283 6.48444C3.38377 6.41021 3.42785 6.32164 3.45798 6.22388C3.48811 6.12612 3.50368 6.02112 3.50378 5.91506C3.50389 5.80899 3.48852 5.70395 3.45858 5.60609C3.42864 5.50822 3.38473 5.41949 3.32941 5.34506C3.27409 5.27062 3.20846 5.21197 3.13637 5.17255C3.06428 5.13313 2.98716 5.11373 2.90951 5.11547L0.595777 5.11147Z" fill="#95757D" />
                <path fillRule="evenodd" clipRule="evenodd" d="M5.38999 10.2599C5.31235 10.258 5.23521 10.2773 5.16307 10.3166C5.09094 10.3558 5.02526 10.4144 4.96986 10.4887C4.91446 10.563 4.87046 10.6517 4.84043 10.7495C4.81039 10.8473 4.79492 10.9523 4.79492 11.0584C4.79492 11.1645 4.81039 11.2695 4.84043 11.3673C4.87046 11.4651 4.91446 11.5538 4.96986 11.6281C5.02526 11.7024 5.09094 11.761 5.16307 11.8003C5.23521 11.8395 5.31235 11.8588 5.38999 11.8569H24.9065C24.9842 11.8588 25.0613 11.8395 25.1334 11.8003C25.2056 11.761 25.2713 11.7024 25.3266 11.6281C25.382 11.5538 25.426 11.4651 25.4561 11.3673C25.4861 11.2695 25.5016 11.1645 25.5016 11.0584C25.5016 10.9523 25.4861 10.8473 25.4561 10.7495C25.426 10.6517 25.382 10.563 25.3266 10.4887C25.2713 10.4144 25.2056 10.3558 25.1334 10.3166C25.0613 10.2773 24.9842 10.258 24.9065 10.2599H5.38999Z" fill="#95757D" />
                <path fillRule="evenodd" clipRule="evenodd" d="M0.595072 10.2286C0.517428 10.2268 0.440287 10.246 0.368152 10.2853C0.296018 10.3246 0.230335 10.3831 0.174938 10.4574C0.119542 10.5318 0.0755413 10.6204 0.0455054 10.7183C0.0154694 10.8161 0 10.9211 0 11.0272C0 11.1332 0.0154694 11.2382 0.0455054 11.3361C0.0755413 11.4339 0.119542 11.5225 0.174938 11.5969C0.230335 11.6712 0.296018 11.7297 0.368152 11.769C0.440287 11.8083 0.517428 11.8276 0.595072 11.8257H2.90882C2.98646 11.8276 3.0636 11.8083 3.13574 11.769C3.20787 11.7297 3.27355 11.6712 3.32895 11.5969C3.38435 11.5225 3.42835 11.4339 3.45838 11.3361C3.48842 11.2382 3.50389 11.1332 3.50389 11.0272C3.50389 10.9211 3.48842 10.8161 3.45838 10.7183C3.42835 10.6204 3.38435 10.5318 3.32895 10.4574C3.27355 10.3831 3.20787 10.3246 3.13574 10.2853C3.0636 10.246 2.98646 10.2268 2.90882 10.2286H0.595072Z" fill="#95757D" />
                <path fillRule="evenodd" clipRule="evenodd" d="M24.9057 15.3712L5.38912 15.4032C5.31149 15.4014 5.23438 15.4208 5.1623 15.4603C5.09023 15.4997 5.02462 15.5583 4.9693 15.6327C4.91399 15.7072 4.87008 15.7959 4.84014 15.8937C4.8102 15.9916 4.79483 16.0966 4.79492 16.2026C4.79501 16.3087 4.81057 16.4136 4.84068 16.5114C4.87078 16.6092 4.91484 16.6977 4.97028 16.772C5.02572 16.8462 5.09143 16.9046 5.16358 16.9438C5.23573 16.983 5.31286 17.0022 5.39049 17.0002L24.9071 16.9683C24.9847 16.97 25.0618 16.9506 25.1339 16.9112C25.206 16.8717 25.2716 16.8131 25.3269 16.7387C25.3822 16.6643 25.4261 16.5755 25.4561 16.4777C25.486 16.3798 25.5014 16.2748 25.5013 16.1688C25.5012 16.0627 25.4857 15.9578 25.4555 15.86C25.4254 15.7623 25.3814 15.6737 25.3259 15.5995C25.2705 15.5252 25.2048 15.4668 25.1326 15.4276C25.0605 15.3884 24.9834 15.3693 24.9057 15.3712Z" fill="#95757D" />
                <path fillRule="evenodd" clipRule="evenodd" d="M2.9078 15.338L0.594149 15.342C0.516519 15.3403 0.439416 15.3597 0.367339 15.3992C0.295263 15.4386 0.229657 15.4972 0.174349 15.5716C0.119041 15.6461 0.0751388 15.7348 0.0452046 15.8326C0.0152703 15.9305 -9.66079e-05 16.0355 4.56973e-07 16.1416C9.75219e-05 16.2476 0.0156566 16.3526 0.0457698 16.4503C0.0758831 16.5481 0.119947 16.6366 0.175391 16.7109C0.230836 16.7851 0.296549 16.8435 0.368697 16.8827C0.440846 16.9219 0.517984 16.941 0.595611 16.9391L2.90935 16.9351C2.98698 16.9368 3.06409 16.9173 3.13616 16.8779C3.20823 16.8385 3.27384 16.7798 3.32914 16.7054C3.38444 16.631 3.42834 16.5422 3.45827 16.4444C3.4882 16.3465 3.50356 16.2415 3.50345 16.1355C3.50335 16.0294 3.48779 15.9245 3.45767 15.8267C3.42755 15.729 3.38348 15.6404 3.32803 15.5662C3.27259 15.4919 3.20687 15.4335 3.13472 15.3944C3.06257 15.3552 2.98542 15.336 2.9078 15.338Z" fill="#95757D" />
              </svg>



              <span className="small">{t("listView")}</span>
            </Link>
          </div>
          <div className="col-4">
            <Link
              href="/dish"
              className={`text-decoration-none d-flex flex-column align-items-center ${pathname === "/dish" ? "text-primary" : "text-secondary"
                }`}
            >

              <svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.8517 19.9985H4.14841C1.86088 19.9985 0 18.1913 0 15.9699V15.5587C0 15.3068 0.209376 15.1035 0.468761 15.1035H29.5312C29.7906 15.1035 30 15.3068 30 15.5587V15.9699C30 18.1913 28.1392 19.9985 25.8517 19.9985ZM0.937602 16.0123C0.96104 17.7117 2.39229 19.0879 4.14853 19.0879H25.8518C27.608 19.0879 29.0393 17.7132 29.0627 16.0123H0.937602Z" fill="#95757D" />
                <path d="M27.5496 16.0126C27.2902 16.0126 27.0808 15.8093 27.0808 15.5574C27.0808 8.93255 21.6604 3.54293 14.9996 3.54293C8.33716 3.54293 2.91994 8.93099 2.91994 15.5574C2.91994 15.8093 2.71057 16.0126 2.45118 16.0126C2.19181 16.0126 1.98242 15.8093 1.98242 15.5574C1.98242 13.814 2.32617 12.1221 3.0043 10.529C3.65899 8.99046 4.59807 7.60816 5.79183 6.42011C6.98715 5.23354 8.37936 4.29887 9.93104 3.64944C11.5373 2.97421 13.2435 2.63281 15.0015 2.63281C16.7593 2.63281 18.4671 2.97422 20.0719 3.64944C21.6234 4.3019 23.0156 5.23354 24.2111 6.42011C25.4064 7.60668 26.3439 8.98747 26.9986 10.529C27.6767 12.1223 28.0205 13.8126 28.0205 15.5574C28.0189 15.8093 27.8096 16.0126 27.5502 16.0126H27.5496Z" fill="#95757D" />
                <path d="M7.18494 8.81029C7.07244 8.81029 6.95994 8.77084 6.87088 8.69193C6.67869 8.52351 6.66463 8.23521 6.83806 8.0486C8.16775 6.6238 9.84587 5.54649 11.6881 4.93501C11.9318 4.85307 12.2006 4.98053 12.2834 5.21724C12.3678 5.45394 12.2365 5.71491 11.9928 5.79535C10.3021 6.35828 8.7584 7.34912 7.53636 8.6601C7.44105 8.75873 7.31307 8.81029 7.18494 8.81029Z" fill="#95757D" />
                <path d="M16.0324 3.58636C15.8918 3.58636 15.7543 3.52567 15.6606 3.41035C15.5028 3.21157 15.5387 2.92631 15.7418 2.77156C15.7418 2.77156 16.7825 1.98559 16.8231 1.95521C16.8262 1.95217 16.8309 1.94914 16.8356 1.94762C17.0684 1.78071 17.0824 1.58953 17.0512 1.45904C17.0043 1.25268 16.8043 1.01296 16.4653 0.949213C16.4496 0.946178 16.4324 0.941626 16.4168 0.937074C16.1887 0.900657 15.0575 0.909761 14.509 0.914314C14.0997 0.917348 13.8825 0.917348 13.7887 0.914314C13.5512 0.902175 13.2653 1.01446 13.0809 1.19351C13.0168 1.2542 12.9106 1.38014 12.9184 1.51822C12.92 1.54553 12.9184 1.56981 12.9153 1.5956C12.909 1.64113 12.959 1.74734 13.1121 1.90211C13.2965 2.08571 13.559 2.27234 13.7918 2.4347C13.9762 2.56367 14.1496 2.68506 14.2777 2.8019C14.4653 2.97487 14.4746 3.26317 14.2965 3.44523C14.1184 3.62731 13.8215 3.63642 13.634 3.46344C13.5496 3.38757 13.4012 3.28288 13.2434 3.17211C12.6825 2.77912 11.9168 2.2435 11.9825 1.52124C11.9762 1.17224 12.1309 0.826275 12.42 0.547103C12.7919 0.185973 13.3356 -0.0203699 13.8403 0.00390765C13.9106 0.00694254 14.2122 0.00542529 14.5044 0.00390765C16.0482 -0.00823112 16.4763 0.00694251 16.6778 0.0630827C17.3278 0.198128 17.8325 0.666992 17.9685 1.26329C18.0935 1.80648 17.8794 2.33453 17.3966 2.68199C17.395 2.68351 17.3935 2.68502 17.3904 2.68502L16.32 3.49224C16.2341 3.55597 16.1324 3.58636 16.0324 3.58636Z" fill="#95757D" />
                <path d="M27.332 13.7776H18.6367C18.3774 13.7776 18.168 13.5743 18.168 13.3224C18.168 13.0705 18.3773 12.8672 18.6367 12.8672H27.332C27.5913 12.8672 27.8007 13.0705 27.8007 13.3224C27.8007 13.5743 27.5929 13.7776 27.332 13.7776Z" fill="#95757D" />
                <path d="M16.8344 13.7776H16.0547C15.7953 13.7776 15.5859 13.5743 15.5859 13.3224C15.5859 13.0705 15.7953 12.8672 16.0547 12.8672H16.8344C17.0938 12.8672 17.3031 13.0705 17.3031 13.3224C17.3031 13.5743 17.0938 13.7776 16.8344 13.7776Z" fill="#95757D" />
              </svg>


              <span className="small">{t("dishView")}</span>
            </Link>
          </div>
          
          <div className="col-4">
            <Link
              href="/map"

              className={`text-decoration-none d-flex flex-column align-items-center ${pathname === "/map" ? "text-primary" : "text-secondary"
                }`}
            >
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.70718 0.903421L9.70712 0.902994L9.69806 0.905051C9.67349 0.910629 9.64951 0.918506 9.62642 0.928574L1.1647 3.95734L1.1647 3.95734L1.16395 3.95761C1.08661 3.98599 1.01986 4.03745 0.972673 4.10501C0.925489 4.17257 0.900134 4.25298 0.9 4.33539V4.33555L0.9 20.6975L0.9 20.6976C0.90011 20.7624 0.915795 20.8262 0.945736 20.8836C0.975678 20.941 1.019 20.9903 1.07205 21.0274C1.1251 21.0645 1.18631 21.0883 1.25049 21.0966C1.31451 21.105 1.37959 21.0977 1.44023 21.0756C1.44038 21.0755 1.44053 21.0755 1.44068 21.0754L9.76744 18.0956L18.0942 21.0754C18.0944 21.0755 18.0945 21.0755 18.0947 21.0756C18.1837 21.1081 18.2814 21.1081 18.3704 21.0756C18.3706 21.0755 18.3708 21.0755 18.3709 21.0754L26.8353 18.0457L26.836 18.0454C26.9134 18.0171 26.9801 17.9656 27.0273 17.898C27.0745 17.8305 27.0999 17.7501 27.1 17.6677V17.6675V1.30557V1.3054C27.0999 1.24065 27.0842 1.17687 27.0543 1.11946C27.0243 1.06205 26.981 1.0127 26.928 0.975609C26.8749 0.938515 26.8137 0.914775 26.7495 0.906418C26.6855 0.898078 26.6204 0.905306 26.5597 0.927482C26.5596 0.927528 26.5594 0.927574 26.5593 0.92762L18.2326 3.90741L9.90663 0.927916C9.8433 0.902991 9.77468 0.894556 9.70718 0.903421ZM1.70465 4.6143L9.36512 1.87364V17.3888L1.70465 20.1294V4.6143ZM10.1698 17.3794V1.8738L17.8302 4.62368V20.1292L10.1698 17.3794ZM18.6349 4.6143L26.2953 1.87364V17.3887L18.6349 20.1294V4.6143Z" fill="#95757D" stroke="#95757D" strokeWidth="0.2" />
              </svg>


              <span className="small">{t("mapView")}</span>
            </Link>
          </div>
          {/* <div className="col-3">
            <Link
              href="/about-us"

              className={`text-decoration-none d-flex flex-column align-items-center ${pathname === "/about-us" ? "text-primary" : "text-secondary"
                }`}
            >
                <svg width="25" height="21" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.69014 10.6498C12.3092 10.6498 14.4412 8.25856 14.4412 5.32288C14.4412 2.38814 12.3092 0 9.69014 0C7.07112 0 4.94336 2.38809 4.94336 5.32288C4.94336 8.26163 7.07221 10.6498 9.69014 10.6498ZM9.69014 0.770272C11.8828 0.770272 13.6709 2.81346 13.6709 5.32288C13.6709 7.83636 11.887 9.8795 9.69014 9.8795C7.49753 9.8795 5.71362 7.83631 5.71362 5.32288C5.71362 2.81357 7.49761 0.770272 9.69014 0.770272Z" fill="#95757D"/>
        <path d="M24.3106 11.6089C24.2008 10.3485 23.0826 9.39951 21.8536 9.49251L16.0647 9.47266C14.8566 9.55731 13.9118 10.5711 13.9076 11.775C13.8794 11.7667 13.8512 11.7583 13.8188 11.751C12.3274 11.3737 11.0462 11.1919 9.89871 11.1919C9.75239 11.1919 9.61131 11.1961 9.48484 11.2044C8.82015 11.2243 8.13877 11.3058 7.45003 11.4396C5.3337 11.8608 3.35526 12.8013 1.73848 14.1517C1.0529 14.7192 0.129038 15.6107 0.0119871 16.7781C-0.0653495 17.54 0.234592 18.3227 0.822969 18.8735C1.47198 19.4776 2.41152 19.765 3.64477 19.7577C3.91231 19.7535 4.75152 19.7661 5.81752 19.7817C7.39039 19.8058 9.4053 19.834 11.0839 19.834C12.4456 19.834 13.589 19.8141 14.0959 19.7566C14.4084 19.7201 14.6958 19.6678 14.9717 19.6061C15.4012 19.9144 15.9039 20.089 16.415 20.089C16.4839 20.089 16.5571 20.0848 16.6261 20.0806L21.932 20.089C23.229 19.9751 24.2229 18.9049 24.2469 17.6037C24.2553 17.2107 24.2709 16.7039 24.2876 16.1489C24.3347 14.552 24.3963 12.5737 24.3106 11.6089ZM14.0101 18.9905C12.9232 19.1118 8.48049 19.047 5.82591 19.0104C4.88533 18.9979 4.16421 18.9864 3.79529 18.9864H3.62912C2.61537 19.0062 1.84514 18.7711 1.34665 18.3091C0.941155 17.9277 0.726905 17.3727 0.779156 16.8543C0.867989 15.9702 1.65076 15.225 2.23393 14.7422C3.75768 13.4734 5.6149 12.5892 7.60463 12.1921C8.24947 12.0625 8.8901 11.9894 9.52656 11.9695C9.64779 11.9612 9.77425 11.957 9.90386 11.957C10.9866 11.957 12.2062 12.1315 13.6329 12.4921C13.7259 12.5161 13.8116 12.5443 13.9004 12.5736C13.8963 12.792 13.8921 13.0272 13.8879 13.279C13.8639 14.7704 13.8315 16.6317 13.9078 17.726C13.936 18.168 14.0823 18.585 14.3216 18.9467C14.2171 18.9623 14.1073 18.979 14.0101 18.9905ZM23.5162 16.1205C23.4995 16.6797 23.4838 17.1907 23.4755 17.5879C23.4588 18.4961 22.7659 19.2423 21.8984 19.3186L16.5925 19.3102C16.118 19.351 15.6519 19.2047 15.2913 18.8922C14.9308 18.5797 14.7113 18.1502 14.6789 17.6757C14.6016 16.6138 14.634 14.7733 14.6622 13.2978C14.6747 12.7021 14.682 12.1712 14.682 11.7939C14.6779 10.9829 15.3143 10.2983 16.0971 10.2408L21.886 10.2607C22.7336 10.2043 23.4745 10.8324 23.5477 11.6758C23.6261 12.5986 23.5654 14.5519 23.5162 16.1205Z" fill="#95757D"/>
        <path d="M20.0359 17.5009C19.8571 17.387 19.6178 17.4445 19.5049 17.6221C19.5008 17.6305 19.4851 17.6389 19.4558 17.6462C19.4067 17.6587 19.3503 17.6462 19.3095 17.6263C19.2081 17.5615 19.135 17.4037 19.1308 17.225C19.1224 17.0097 19.1872 16.7714 19.2562 16.5394L19.6209 15.2466C19.6941 14.9874 19.7788 14.6948 19.7505 14.3708C19.714 13.9455 19.4788 13.5922 19.1381 13.4428C18.9071 13.3414 18.6312 13.3539 18.4003 13.4793C18.1933 13.5891 18.0481 13.7793 18.0073 13.9977C17.9665 14.2088 18.1003 14.4231 18.3114 14.4597C18.5184 14.4962 18.7169 14.375 18.7535 14.1639C18.7702 14.1513 18.8099 14.144 18.8308 14.1472C18.9082 14.1796 18.9688 14.3008 18.9813 14.4314C18.998 14.6143 18.9364 14.8286 18.8799 15.0313L18.5152 16.3283C18.4379 16.6042 18.349 16.9198 18.3616 17.2564C18.3814 17.6901 18.5769 18.0674 18.8925 18.2702C19.0461 18.3715 19.229 18.4207 19.4109 18.4207C19.4798 18.4207 19.553 18.4123 19.622 18.3966C19.8487 18.3444 20.04 18.2137 20.157 18.0277C20.271 17.85 20.2146 17.6148 20.0359 17.5009Z" fill="#95757D"/>
        <path d="M18.9842 12.9771C19.0082 12.9813 19.0364 12.9855 19.0615 12.9855C19.2402 12.9855 19.4022 12.8601 19.4388 12.673L19.6217 11.7648C19.6625 11.5579 19.5287 11.3509 19.3176 11.3112C19.1107 11.2663 18.9037 11.4042 18.864 11.6154L18.6811 12.5235C18.6404 12.7347 18.7741 12.9374 18.9842 12.9771Z" fill="#95757D"/>
        </svg>


              <span className="small">{t("aboutUs")}</span>
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  )
}

