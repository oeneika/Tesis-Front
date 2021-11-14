import { INavData } from "@coreui/angular";

export const navItems: INavData[] = [
  {
    name: "Reportes",
    url: "/dashboard",
    icon: "icon-speedometer",
  },
  {
    title: true,
    name: "Opciones del sistema",
  },
  {
    name: "Cámara",
    url: "/cemara",
    icon: "icon-camera",
    children: [
      {
        name: "Modo cámara",
        url: "/camera",
      },
      {
        name: "Mis cámaras",
        url: "/camera/list-cameras",
      },
      {
        name: "Compartidas conmigo",
        url: "/camera/camera-shared-with-me",
      },
    ],
  },
  {
    name: "Niveles de confianza",
    url: "/confidence-levels",
    icon: "icon-notebook",
  },
];
