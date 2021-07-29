import { INavData } from "@coreui/angular";

export const navItems: INavData[] = [
  {
    name: "Reportes",
    url: "/dashboard",
    icon: "icon-speedometer",
  },
  {
    title: true,
    name: "Opciones",
  },
  {
    name: "Cámara",
    url: "/cemara",
    icon: "icon-camera",
    children: [
      {
        name: "Modo cámara",
        url: "/camera",
        badge: {
          variant: "danger",
          text: "EN VIVO",
        },
      },
      {
        name: "Listado de cámara",
        url: "/camera/list-cameras",
      },
    ],
  },
  {
    name: "Grabaciones",
    url: "/",
    icon: "icon-camrecorder",
  },
  {
    name: "Niveles de confianza",
    url: "/confidence-levels",
    icon: "icon-notebook",
  },
];
