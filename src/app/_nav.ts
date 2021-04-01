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
    icon: "icon-puzzle",
    children: [
      {
        name: "Modo cámara",
        url: "/camera",
        icon: "icon-puzzle",
        badge: {
          variant: "danger",
          text: "EN VIVO",
        },
      },
      {
        name: "Listado de cámara",
        url: "/camera/list-cameras",
        icon: "icon-puzzle",
      },
    ],
  },
  {
    name: "Niveles de confianza",
    url: "/confidence-levels",
    icon: "icon-drop",
  },
  {
    name: "Notificaciones",
    url: "/notifications",
    icon: "icon-pencil",
  },
];
