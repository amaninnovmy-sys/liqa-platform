import OfficeConsole from '../../components/office-console';
import {requireStaff} from '../../lib/server/session';
export const dynamic='force-dynamic';
export default async function MarketerPage(){const {staff}=await requireStaff('marketer');return <OfficeConsole role="marketer" live staff={staff}/>;}
