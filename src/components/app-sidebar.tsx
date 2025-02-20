import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className='text-2xl'>
          <Link href='/' className='font-semibold'>
            Helper tools
          </Link>
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup title='videos'>
          <SidebarGroupLabel className='font-black'>Vídeos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuButton asChild>
                <Link href='/video/download'>Download Vídeo</Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href='/video/convert'>Converter Vídeo</Link>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup title='Documentos'>
          <SidebarGroupLabel className='font-black'>
            Documentos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuButton asChild>
                <Link href='/document/convert'>Converter Documento</Link>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='p-4'>
        <SidebarMenuButton asChild>
          <Link href='/settings'>
            <Settings />
            <div className='text-base'>Configurações</div>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
