import OfficeConsole from '../../components/office-console';
import {requireStaff} from '../../lib/server/session';
export const dynamic='force-dynamic';
export default async function AdminPage(){const {staff}=await requireStaff('admin');return <OfficeConsole role="admin" live staff={staff}/>;}
