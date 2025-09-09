import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateReport, useReport, useUpdateReport } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';
import { useTypes } from '../context/TypesContext';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Textarea } from '../components/atoms/Textarea';
import { PhotoUpload } from '../components/molecules/PhotoUpload';
import { LoadingSpinner } from '../components/molecules/LoadingSpinner';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle 
} from 'lucide-react';
import { apiService } from '../services/api';

export const NewReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state: authState } = useAuth();
  const { machineTypes, componentTypes } = useTypes();
  const createReportMutation = useCreateReport();
  const updateReportMutation = useUpdateReport();

  const isEditMode = Boolean(id);
  const { data: reportResponse, isLoading: isLoadingReport } = useReport(id || '');

  const [initialized, setInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [reportData, setReportData] = useState({
    clientName: '',
    clientContact: '',
    machineType: '',
    model: '',
    serialNumber: '',
    hourmeter: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    ott: '',
    reasonOfService: '',
    conclusions: '',
    overallSuggestions: '',
  });

  const [components, setComponents] = useState<Array<{
    id?: string;
    type: string;
    findings: string;
    parameters?: { name: string; minValue: number; maxValue: number; measuredValue: number; corrected: boolean; observation: string }[];
    status: 'CORRECTED' | 'PENDING';
    suggestions?: string;
    photos: Array<File | { id: string; url: string; filename: string }>;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }>>([]);

  const [suggestedParts, setSuggestedParts] = useState<Array<{
    partNumber: string;
    description: string;
    quantity: number;
  }>>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convert machine types to options (lista fija y ordenada alfabéticamente)
  const machineTypeOptions = [
    { value: 'ADITAMENTOS / ATTACHMENTS', label: 'ADITAMENTOS / ATTACHMENTS' },
    { value: 'AHOYADOR / AUGER', label: 'AHOYADOR / AUGER' },
    { value: 'ASFALTADORA / ASPHALT PAVER', label: 'ASFALTADORA / ASPHALT PAVER' },
    { value: 'AUTOMOVILES / AUTOMOBILES', label: 'AUTOMOVILES / AUTOMOBILES' },
    { value: 'BARCAZA / BARGE', label: 'BARCAZA / BARGE' },
    { value: 'BRAZO EXCAVADOR / EXCAVATOR ARM', label: 'BRAZO EXCAVADOR / EXCAVATOR ARM' },
    { value: 'BULLDOZER / BULLDOZER', label: 'BULLDOZER / BULLDOZER' },
    { value: 'BUS / BUS', label: 'BUS / BUS' },
    { value: 'CABINA / CABIN', label: 'CABINA / CABIN' },
    { value: 'CAMA BAJA / LOWBOY TRAILER', label: 'CAMA BAJA / LOWBOY TRAILER' },
    { value: 'CAMION / TRUCK', label: 'CAMION / TRUCK' },
    { value: 'CAMIONETA / PICKUP TRUCK', label: 'CAMIONETA / PICKUP TRUCK' },
    { value: 'CAMPERO / SUV', label: 'CAMPERO / SUV' },
    { value: 'CARGADOR / LOADER', label: 'CARGADOR / LOADER' },
    { value: 'CLASIFICADORAS / SCREENING MACHINES', label: 'CLASIFICADORAS / SCREENING MACHINES' },
    { value: 'COMPACTADOR / COMPACTOR', label: 'COMPACTADOR / COMPACTOR' },
    { value: 'COSECHADORAS ACUATICAS / AQUATIC HARVESTERS', label: 'COSECHADORAS ACUATICAS / AQUATIC HARVESTERS' },
    { value: 'CRIBA / SCREEN', label: 'CRIBA / SCREEN' },
    { value: 'EQUIPO MENOR / SMALL EQUIPMENT', label: 'EQUIPO MENOR / SMALL EQUIPMENT' },
    { value: 'EXCAVADORA / EXCAVATOR', label: 'EXCAVADORA / EXCAVATOR' },
    { value: 'FRESADORA / MILLING MACHINE', label: 'FRESADORA / MILLING MACHINE' },
    { value: 'GRADER / GRADER', label: 'GRADER / GRADER' },
    { value: 'GRÚA / CRANE', label: 'GRÚA / CRANE' },
    { value: 'LOADER / LOADER', label: 'LOADER / LOADER' },
    { value: 'MARTILLO HIDRÁULICO / BREAKER', label: 'MARTILLO HIDRÁULICO / BREAKER' },
    { value: 'MINICARGADOR / SKID STEER LOADER', label: 'MINICARGADOR / SKID STEER LOADER' },
    { value: 'MINIEXCAVADORA / MINI EXCAVATOR', label: 'MINIEXCAVADORA / MINI EXCAVATOR' },
    { value: 'MINIMULA / SMALL SEMI-TRAILER TRUCK', label: 'MINIMULA / SMALL SEMI-TRAILER TRUCK' },
    { value: 'MONTACARGAS / FORKLIFT', label: 'MONTACARGAS / FORKLIFT' },
    { value: 'MOTONIVELADORA / MOTOR GRADER', label: 'MOTONIVELADORA / MOTOR GRADER' },
    { value: 'MOTOR / ENGINE', label: 'MOTOR / ENGINE' },
    { value: 'OTROS / OTHERS', label: 'OTROS / OTHERS' },
    { value: 'PALADRAGA / DREDGER', label: 'PALADRAGA / DREDGER' },
    { value: 'PERFORADORA / DRILLING MACHINE', label: 'PERFORADORA / DRILLING MACHINE' },
    { value: 'PLANTA ELECTRICA / GENERATOR', label: 'PLANTA ELECTRICA / GENERATOR' },
    { value: 'REPUESTOS / SPARE PARTS', label: 'REPUESTOS / SPARE PARTS' },
    { value: 'RETROCARGADOR / BACKHOE LOADER', label: 'RETROCARGADOR / BACKHOE LOADER' },
    { value: 'SOLDADORES / WELDERS', label: 'SOLDADORES / WELDERS' },
    { value: 'TORRES DE ILUMINACION / LIGHT TOWERS', label: 'TORRES DE ILUMINACION / LIGHT TOWERS' },
    { value: 'TRACTOCAMIONES / SEMI-TRAILER TRUCKS', label: 'TRACTOCAMIONES / SEMI-TRAILER TRUCKS' },
    { value: 'TRACTOR / TRACTOR', label: 'TRACTOR / TRACTOR' },
    { value: 'TRITURADORAS / CRUSHERS', label: 'TRITURADORAS / CRUSHERS' },
    { value: 'VIBROCOMPACTADOR / VIBRATORY COMPACTOR', label: 'VIBROCOMPACTADOR / VIBRATORY COMPACTOR' },
    { value: 'VOLQUETA / DUMP TRUCK', label: 'VOLQUETA / DUMP TRUCK' },
  ];

  // Convert component types to options
  const componentTypeOptions = componentTypes.map(ct => ({
    value: ct.name,
    label: ct.name
  }));

  // Lista de modelos actualizada
  const modelOptions = [
    { value: 'AIRMAN AX35U40', label: 'AIRMAN AX35U40' },
    { value: 'AIRMAN AX50U-3', label: 'AIRMAN AX50U-3' },
    { value: 'AMMANN ACM PRIME 100', label: 'AMMANN ACM PRIME 100' },
    { value: 'AMMANN ACR60 S3', label: 'AMMANN ACR60 S3' },
    { value: 'AMMANN ACR70D', label: 'AMMANN ACR70D' },
    { value: 'AMMANN AFW150', label: 'AMMANN AFW150' },
    { value: 'AMMANN APF1250', label: 'AMMANN APF1250' },
    { value: 'AMMANN ARS122', label: 'AMMANN ARS122' },
    { value: 'AMMANN ARW65', label: 'AMMANN ARW65' },
    { value: 'AMMANN ARX23-2', label: 'AMMANN ARX23-2' },
    { value: 'AMMANN ARX26', label: 'AMMANN ARX26' },
    { value: 'AMMANN ARX40-2', label: 'AMMANN ARX40-2' },
    { value: 'AMMANN ARX45-2C', label: 'AMMANN ARX45-2C' },
    { value: 'AMMANN ARX45K', label: 'AMMANN ARX45K' },
    { value: 'AMMANN AS1C100', label: 'AMMANN AS1C100' },
    { value: 'AMMANN ASC100', label: 'AMMANN ASC100' },
    { value: 'AMMANN ASC70', label: 'AMMANN ASC70' },
    { value: 'AMMANN ASC70D', label: 'AMMANN ASC70D' },
    { value: 'AMMANN ATF300-2', label: 'AMMANN ATF300-2' },
    { value: 'AMMANN AV110X', label: 'AMMANN AV110X' },
    { value: 'AMMANN PRIME 140', label: 'AMMANN PRIME 140' },
    { value: 'AQUAMARINE H5-200', label: 'AQUAMARINE H5-200' },
    { value: 'ASTILLERO ASTILLERO', label: 'ASTILLERO ASTILLERO' },
    { value: 'ATLAS AW1070', label: 'ATLAS AW1070' },
    { value: 'ATLAS AW1110', label: 'ATLAS AW1110' },
    { value: 'ATLAS AW1120', label: 'ATLAS AW1120' },
    { value: 'ATLAS AW1130', label: 'ATLAS AW1130' },
    { value: 'ATLAS AW1140', label: 'ATLAS AW1140' },
    { value: 'ATLAS AW240', label: 'ATLAS AW240' },
    { value: 'ATLAS AW260', label: 'ATLAS AW260' },
    { value: 'ATLAS AW300', label: 'ATLAS AW300' },
    { value: 'AUGERTORQUE 2700-25', label: 'AUGERTORQUE 2700-25' },
    { value: 'BOBCAT 1272', label: 'BOBCAT 1272' },
    { value: 'BOBCAT S185', label: 'BOBCAT S185' },
    { value: 'BOBCAT S570', label: 'BOBCAT S570' },
    { value: 'BOMAG BW177D-5', label: 'BOMAG BW177D-5' },
    { value: 'BOMAG BW177DH-4', label: 'BOMAG BW177DH-4' },
    { value: 'CASE 1107 EX-D', label: 'CASE 1107 EX-D' },
    { value: 'CASE 1107EX', label: 'CASE 1107EX' },
    { value: 'CASE 1150K', label: 'CASE 1150K' },
    { value: 'CASE 1150L', label: 'CASE 1150L' },
    { value: 'CASE 1150M', label: 'CASE 1150M' },
    { value: 'CASE 1650L', label: 'CASE 1650L' },
    { value: 'CASE 1650M', label: 'CASE 1650M' },
    { value: 'CASE 1850K', label: 'CASE 1850K' },
    { value: 'CASE 2050M', label: 'CASE 2050M' },
    { value: 'CASE 240C-8', label: 'CASE 240C-8' },
    { value: 'CASE 40XT', label: 'CASE 40XT' },
    { value: 'CASE 430', label: 'CASE 430' },
    { value: 'CASE 430.', label: 'CASE 430.' },
    { value: 'CASE 440', label: 'CASE 440' },
    { value: 'CASE 570ST', label: 'CASE 570ST' },
    { value: 'CASE 575SV', label: 'CASE 575SV' },
    { value: 'CASE 580M', label: 'CASE 580M' },
    { value: 'CASE 580N', label: 'CASE 580N' },
    { value: 'CASE 580SK', label: 'CASE 580SK' },
    { value: 'CASE 580SL', label: 'CASE 580SL' },
    { value: 'CASE 580SM', label: 'CASE 580SM' },
    { value: 'CASE 580SN', label: 'CASE 580SN' },
    { value: 'CASE 580SV', label: 'CASE 580SV' },
    { value: 'CASE 590SM', label: 'CASE 590SM' },
    { value: 'CASE 590SN', label: 'CASE 590SN' },
    { value: 'CASE 621 E', label: 'CASE 621 E' },
    { value: 'CASE 621D', label: 'CASE 621D' },
    { value: 'CASE 621E', label: 'CASE 621E' },
    { value: 'CASE 621F', label: 'CASE 621F' },
    { value: 'CASE 650L', label: 'CASE 650L' },
    { value: 'CASE 721F', label: 'CASE 721F' },
    { value: 'CASE 770FX-4WD', label: 'CASE 770FX-4WD' },
    { value: 'CASE 821C', label: 'CASE 821C' },
    { value: 'CASE 821E', label: 'CASE 821E' },
    { value: 'CASE 821F', label: 'CASE 821F' },
    { value: 'CASE 821G', label: 'CASE 821G' },
    { value: 'CASE 845B', label: 'CASE 845B' },
    { value: 'CASE 865B', label: 'CASE 865B' },
    { value: 'CASE 885B', label: 'CASE 885B' },
    { value: 'CASE CASE', label: 'CASE CASE' },
    { value: 'CASE CX130', label: 'CASE CX130' },
    { value: 'CASE CX130B', label: 'CASE CX130B' },
    { value: 'CASE CX130C', label: 'CASE CX130C' },
    { value: 'CASE CX135SR', label: 'CASE CX135SR' },
    { value: 'CASE CX210', label: 'CASE CX210' },
    { value: 'CASE CX210B', label: 'CASE CX210B' },
    { value: 'CASE CX210C', label: 'CASE CX210C' },
    { value: 'CASE CX220-8', label: 'CASE CX220-8' },
    { value: 'CASE CX220C', label: 'CASE CX220C' },
    { value: 'CASE CX240', label: 'CASE CX240' },
    { value: 'CASE CX240C-8', label: 'CASE CX240C-8' },
    { value: 'CASE CX26C', label: 'CASE CX26C' },
    { value: 'CASE CX300C', label: 'CASE CX300C' },
    { value: 'CASE CX330', label: 'CASE CX330' },
    { value: 'CASE CX350B', label: 'CASE CX350B' },
    { value: 'CASE CX350C-8', label: 'CASE CX350C-8' },
    { value: 'CASE CX380C-8', label: 'CASE CX380C-8' },
    { value: 'CASE CX490C-8', label: 'CASE CX490C-8' },
    { value: 'CASE EXCAVADORA', label: 'CASE EXCAVADORA' },
    { value: 'CASE FARMALL A110', label: 'CASE FARMALL A110' },
    { value: 'CASE MOTONIVELADORA CASE 865B', label: 'CASE MOTONIVELADORA CASE 865B' },
    { value: 'CASE SR175', label: 'CASE SR175' },
    { value: 'CASE SR175B', label: 'CASE SR175B' },
    { value: 'CASE SR200', label: 'CASE SR200' },
    { value: 'CASE SR200B', label: 'CASE SR200B' },
    { value: 'CASE SR210B', label: 'CASE SR210B' },
    { value: 'CASE SR220', label: 'CASE SR220' },
    { value: 'CASE SR220B', label: 'CASE SR220B' },
    { value: 'CASE SR240B', label: 'CASE SR240B' },
    { value: 'CASE SR250', label: 'CASE SR250' },
    { value: 'CASE SR250B', label: 'CASE SR250B' },
    { value: 'CASE SR270', label: 'CASE SR270' },
    { value: 'CASE SV208', label: 'CASE SV208' },
    { value: 'CASE SV210', label: 'CASE SV210' },
    { value: 'CASE SV212', label: 'CASE SV212' },
    { value: 'CASE SV250', label: 'CASE SV250' },
    { value: 'CASE SV280', label: 'CASE SV280' },
    { value: 'CASE SV300', label: 'CASE SV300' },
    { value: 'CASE W14C', label: 'CASE W14C' },
    { value: 'CASE W20E', label: 'CASE W20E' },
    { value: 'CASE W20F', label: 'CASE W20F' },
    { value: 'CATERPILLAR 120', label: 'CATERPILLAR 120' },
    { value: 'CATERPILLAR 120G', label: 'CATERPILLAR 120G' },
    { value: 'CATERPILLAR 120K', label: 'CATERPILLAR 120K' },
    { value: 'CATERPILLAR 120M', label: 'CATERPILLAR 120M' },
    { value: 'CATERPILLAR 123K', label: 'CATERPILLAR 123K' },
    { value: 'CATERPILLAR 2012', label: 'CATERPILLAR 2012' },
    { value: 'CATERPILLAR 226B3', label: 'CATERPILLAR 226B3' },
    { value: 'CATERPILLAR 236B', label: 'CATERPILLAR 236B' },
    { value: 'CATERPILLAR 236D', label: 'CATERPILLAR 236D' },
    { value: 'CATERPILLAR 247B', label: 'CATERPILLAR 247B' },
    { value: 'CATERPILLAR 304C', label: 'CATERPILLAR 304C' },
    { value: 'CATERPILLAR 305CB', label: 'CATERPILLAR 305CB' },
    { value: 'CATERPILLAR 305CR', label: 'CATERPILLAR 305CR' },
    { value: 'CATERPILLAR 305CR-2', label: 'CATERPILLAR 305CR-2' },
    { value: 'CATERPILLAR 308D', label: 'CATERPILLAR 308D' },
    { value: 'CATERPILLAR 312C', label: 'CATERPILLAR 312C' },
    { value: 'CATERPILLAR 312D', label: 'CATERPILLAR 312D' },
    { value: 'CATERPILLAR 312DL-2', label: 'CATERPILLAR 312DL-2' },
    { value: 'CATERPILLAR 320B', label: 'CATERPILLAR 320B' },
    { value: 'CATERPILLAR 320D', label: 'CATERPILLAR 320D' },
    { value: 'CATERPILLAR 320D2GC', label: 'CATERPILLAR 320D2GC' },
    { value: 'CATERPILLAR 320D-E', label: 'CATERPILLAR 320D-E' },
    { value: 'CATERPILLAR 320GX', label: 'CATERPILLAR 320GX' },
    { value: 'CATERPILLAR 320L', label: 'CATERPILLAR 320L' },
    { value: 'CATERPILLAR 323', label: 'CATERPILLAR 323' },
    { value: 'CATERPILLAR 323D', label: 'CATERPILLAR 323D' },
    { value: 'CATERPILLAR 416B', label: 'CATERPILLAR 416B' },
    { value: 'CATERPILLAR 416E', label: 'CATERPILLAR 416E' },
    { value: 'CATERPILLAR 416F2', label: 'CATERPILLAR 416F2' },
    { value: 'CATERPILLAR 420D', label: 'CATERPILLAR 420D' },
    { value: 'CATERPILLAR 420E', label: 'CATERPILLAR 420E' },
    { value: 'CATERPILLAR 428', label: 'CATERPILLAR 428' },
    { value: 'CATERPILLAR 433C', label: 'CATERPILLAR 433C' },
    { value: 'CATERPILLAR 924K', label: 'CATERPILLAR 924K' },
    { value: 'CATERPILLAR 928H', label: 'CATERPILLAR 928H' },
    { value: 'CATERPILLAR 938G', label: 'CATERPILLAR 938G' },
    { value: 'CATERPILLAR 938H', label: 'CATERPILLAR 938H' },
    { value: 'CATERPILLAR 950H', label: 'CATERPILLAR 950H' },
    { value: 'CATERPILLAR BALDE', label: 'CATERPILLAR BALDE' },
    { value: 'CATERPILLAR CAT120H', label: 'CATERPILLAR CAT120H' },
    { value: 'CATERPILLAR CAT140K', label: 'CATERPILLAR CAT140K' },
    { value: 'CATERPILLAR CAT320D', label: 'CATERPILLAR CAT320D' },
    { value: 'CATERPILLAR CAT420E', label: 'CATERPILLAR CAT420E' },
    { value: 'CATERPILLAR CAT420F', label: 'CATERPILLAR CAT420F' },
    { value: 'CATERPILLAR CS533E', label: 'CATERPILLAR CS533E' },
    { value: 'CATERPILLAR CS-533E', label: 'CATERPILLAR CS-533E' },
    { value: 'CATERPILLAR D3C', label: 'CATERPILLAR D3C' },
    { value: 'CATERPILLAR D3G', label: 'CATERPILLAR D3G' },
    { value: 'CATERPILLAR D4G LGP', label: 'CATERPILLAR D4G LGP' },
    { value: 'CATERPILLAR D5G', label: 'CATERPILLAR D5G' },
    { value: 'CATERPILLAR D5G LGP', label: 'CATERPILLAR D5G LGP' },
    { value: 'CATERPILLAR D5G XL', label: 'CATERPILLAR D5G XL' },
    { value: 'CATERPILLAR D5K', label: 'CATERPILLAR D5K' },
    { value: 'CATERPILLAR D6C', label: 'CATERPILLAR D6C' },
    { value: 'CATERPILLAR D6D', label: 'CATERPILLAR D6D' },
    { value: 'CATERPILLAR D6K', label: 'CATERPILLAR D6K' },
    { value: 'CATERPILLAR D6M', label: 'CATERPILLAR D6M' },
    { value: 'CATERPILLAR D6N', label: 'CATERPILLAR D6N' },
    { value: 'CATERPILLAR E200B', label: 'CATERPILLAR E200B' },
    { value: 'CATERPILLAR LJR', label: 'CATERPILLAR LJR' },
    { value: 'CATERPILLAR MOTONIVELADORA', label: 'CATERPILLAR MOTONIVELADORA' },
    { value: 'CATERPILLAR VIBROCOMPACTADOR CAT CB-335E', label: 'CATERPILLAR VIBROCOMPACTADOR CAT CB-335E' },
    { value: 'CHEVROLET C70', label: 'CHEVROLET C70' },
    { value: 'CHEVROLET CARROTANQUE PARA AGUA', label: 'CHEVROLET CARROTANQUE PARA AGUA' },
    { value: 'CHEVROLET DMAX', label: 'CHEVROLET DMAX' },
    { value: 'CHEVROLET FRR', label: 'CHEVROLET FRR' },
    { value: 'CHEVROLET FTR', label: 'CHEVROLET FTR' },
    { value: 'CHEVROLET FVR', label: 'CHEVROLET FVR' },
    { value: 'CHEVROLET FVR 700P', label: 'CHEVROLET FVR 700P' },
    { value: 'CHEVROLET FVZ', label: 'CHEVROLET FVZ' },
    { value: 'CHEVROLET KODIAK', label: 'CHEVROLET KODIAK' },
    { value: 'CHEVROLET LUV DMAX DSL', label: 'CHEVROLET LUV DMAX DSL' },
    { value: 'CHEVROLET NHR', label: 'CHEVROLET NHR' },
    { value: 'CHEVROLET NPR', label: 'CHEVROLET NPR' },
    { value: 'CMSC X2475', label: 'CMSC X2475' },
    { value: 'CUMMINS 6BT.', label: 'CUMMINS 6BT.' },
    { value: 'DENYO TLW300', label: 'DENYO TLW300' },
    { value: 'DODGE DODGE 600', label: 'DODGE DODGE 600' },
    { value: 'DONALDSON MAQUINA DIALISIS', label: 'DONALDSON MAQUINA DIALISIS' },
    { value: 'DOOSAN DX140LC', label: 'DOOSAN DX140LC' },
    { value: 'DOOSAN DX140W', label: 'DOOSAN DX140W' },
    { value: 'DOOSAN DX225LCA', label: 'DOOSAN DX225LCA' },
    { value: 'DPS MOTOBOMBA DPS - 017', label: 'DPS MOTOBOMBA DPS - 017' },
    { value: 'EIK- LONG REACH PC200-7', label: 'EIK- LONG REACH PC200-7' },
    { value: 'ELLICOTT DRAGA', label: 'ELLICOTT DRAGA' },
    { value: 'EUROIMPLEMENTOS BARREDORA - 03CBTI1700', label: 'EUROIMPLEMENTOS BARREDORA - 03CBTI1700' },
    { value: 'EUROIMPLEMENTOS BRAZO EXCAVADOR - OP3.2CU', label: 'EUROIMPLEMENTOS BRAZO EXCAVADOR - OP3.2CU' },
    { value: 'EUROIMPLEMENTOS CLASIFICADORA VIBRATORIA', label: 'EUROIMPLEMENTOS CLASIFICADORA VIBRATORIA' },
    { value: 'EUROIMPLEMENTOS COMPACTADOR-12CVL1220', label: 'EUROIMPLEMENTOS COMPACTADOR-12CVL1220' },
    { value: 'EUROIMPLEMENTOS CORTADORA DE PISO', label: 'EUROIMPLEMENTOS CORTADORA DE PISO' },
    { value: 'EUROIMPLEMENTOS PORTAHORQUILLAS - 13TH2000', label: 'EUROIMPLEMENTOS PORTAHORQUILLAS - 13TH2000' },
    { value: 'FIAT 14C', label: 'FIAT 14C' },
    { value: 'FORD 5000', label: 'FORD 5000' },
    { value: 'FORD FORD', label: 'FORD FORD' },
    { value: 'FORD RANGER', label: 'FORD RANGER' },
    { value: 'FORTE MOTOBOMBA FORTE', label: 'FORTE MOTOBOMBA FORTE' },
    { value: 'FOTON AUMAN-TX3233', label: 'FOTON AUMAN-TX3233' },
    { value: 'FOTON FORTLAND', label: 'FOTON FORTLAND' },
    { value: 'FOTON TX4111', label: 'FOTON TX4111' },
    { value: 'FREIGHTLINER 114SD', label: 'FREIGHTLINER 114SD' },
    { value: 'FREIGHTLINER M2 106', label: 'FREIGHTLINER M2 106' },
    { value: 'FREIGHTLINER NEW CASCADIA 116', label: 'FREIGHTLINER NEW CASCADIA 116' },
    { value: 'FURUKAWA S35', label: 'FURUKAWA S35' },
    { value: 'GENERICA ATTLAR', label: 'GENERICA ATTLAR' },
    { value: 'GENERICA DD24', label: 'GENERICA DD24' },
    { value: 'GENERICA EQUIPOS DE TALLER', label: 'GENERICA EQUIPOS DE TALLER' },
    { value: 'GENERICA HTAS DE DIAGNOSTICO', label: 'GENERICA HTAS DE DIAGNOSTICO' },
    { value: 'GENERICA HTAS DE MANO MAYOR', label: 'GENERICA HTAS DE MANO MAYOR' },
    { value: 'GENERICA HTAS DE MANO MENORES', label: 'GENERICA HTAS DE MANO MENORES' },
    { value: 'GENERICA HTAS DE MEDICION Y CALIBRACION', label: 'GENERICA HTAS DE MEDICION Y CALIBRACION' },
    { value: 'GENERICA MANUALES', label: 'GENERICA MANUALES' },
    { value: 'GENERICA MAQUINARIA AGRICOLA', label: 'GENERICA MAQUINARIA AGRICOLA' },
    { value: 'GENERICA MOTOBOMBA', label: 'GENERICA MOTOBOMBA' },
    { value: 'GENERICA OT GASTOS UTO', label: 'GENERICA OT GASTOS UTO' },
    { value: 'GENERICA OT INSUMOS DE MANTENIMIENTO', label: 'GENERICA OT INSUMOS DE MANTENIMIENTO' },
    { value: 'GENERICA TORNILLO BRISTOL M8X130 P1.25', label: 'GENERICA TORNILLO BRISTOL M8X130 P1.25' },
    { value: 'GENERICA TRACTOR', label: 'GENERICA TRACTOR' },
    { value: 'GENERICA VRS72', label: 'GENERICA VRS72' },
    { value: 'HDROAMERICA CAMABAJA TRES EJES', label: 'HDROAMERICA CAMABAJA TRES EJES' },
    { value: 'HDROAMERICA TRACTEC', label: 'HDROAMERICA TRACTEC' },
    { value: 'HINO 1526', label: 'HINO 1526' },
    { value: 'HINO 300GT', label: 'HINO 300GT' },
    { value: 'HINO 500-7DSGB', label: 'HINO 500-7DSGB' },
    { value: 'HINO 500-GH8J', label: 'HINO 500-GH8J' },
    { value: 'HINO FC9J', label: 'HINO FC9J' },
    { value: 'HINO FM1J', label: 'HINO FM1J' },
    { value: 'HINO HINO', label: 'HINO HINO' },
    { value: 'HINO SG1A', label: 'HINO SG1A' },
    { value: 'HITACHI 130LCN', label: 'HITACHI 130LCN' },
    { value: 'HITACHI 210LC-5G', label: 'HITACHI 210LC-5G' },
    { value: 'HITACHI 6BG1', label: 'HITACHI 6BG1' },
    { value: 'HITACHI AX30U-4', label: 'HITACHI AX30U-4' },
    { value: 'HITACHI AX35U4', label: 'HITACHI AX35U4' },
    { value: 'HITACHI AX35U-4', label: 'HITACHI AX35U-4' },
    { value: 'HITACHI AX40U', label: 'HITACHI AX40U' },
    { value: 'HITACHI AX40U-5', label: 'HITACHI AX40U-5' },
    { value: 'HITACHI BRAZO LARGO', label: 'HITACHI BRAZO LARGO' },
    { value: 'HITACHI CABINA', label: 'HITACHI CABINA' },
    { value: 'HITACHI CC150C-3A', label: 'HITACHI CC150C-3A' },
    { value: 'HITACHI EX100-2', label: 'HITACHI EX100-2' },
    { value: 'HITACHI EX100-3', label: 'HITACHI EX100-3' },
    { value: 'HITACHI EX100-5', label: 'HITACHI EX100-5' },
    { value: 'HITACHI EX10U', label: 'HITACHI EX10U' },
    { value: 'HITACHI EX120-3', label: 'HITACHI EX120-3' },
    { value: 'HITACHI EX120-3M', label: 'HITACHI EX120-3M' },
    { value: 'HITACHI EX120-5', label: 'HITACHI EX120-5' },
    { value: 'HITACHI EX200', label: 'HITACHI EX200' },
    { value: 'HITACHI EX200-2', label: 'HITACHI EX200-2' },
    { value: 'HITACHI EX200-5', label: 'HITACHI EX200-5' },
    { value: 'HITACHI EX230LC-5', label: 'HITACHI EX230LC-5' },
    { value: 'HITACHI EX330LC-5', label: 'HITACHI EX330LC-5' },
    { value: 'HITACHI EX40U', label: 'HITACHI EX40U' },
    { value: 'HITACHI EX5', label: 'HITACHI EX5' },
    { value: 'HITACHI EX50U', label: 'HITACHI EX50U' },
    { value: 'HITACHI EX5-2', label: 'HITACHI EX5-2' },
    { value: 'HITACHI EX60-2', label: 'HITACHI EX60-2' },
    { value: 'HITACHI EX60-3', label: 'HITACHI EX60-3' },
    { value: 'HITACHI EX60-5', label: 'HITACHI EX60-5' },
    { value: 'HITACHI EX70LCK-5', label: 'HITACHI EX70LCK-5' },
    { value: 'HITACHI INSTALACION ZAPATAS', label: 'HITACHI INSTALACION ZAPATAS' },
    { value: 'HITACHI K120-3', label: 'HITACHI K120-3' },
    { value: 'HITACHI K-135US-3', label: 'HITACHI K-135US-3' },
    { value: 'HITACHI K70-3', label: 'HITACHI K70-3' },
    { value: 'HITACHI MOTOR TRASLACION', label: 'HITACHI MOTOR TRASLACION' },
    { value: 'HITACHI MPRUEBA', label: 'HITACHI MPRUEBA' },
    { value: 'HITACHI MPRUEBA2', label: 'HITACHI MPRUEBA2' },
    { value: 'HITACHI SENSOR', label: 'HITACHI SENSOR' },
    { value: 'HITACHI ZX110-3', label: 'HITACHI ZX110-3' },
    { value: 'HITACHI ZX120', label: 'HITACHI ZX120' },
    { value: 'HITACHI ZX120-3', label: 'HITACHI ZX120-3' },
    { value: 'HITACHI ZX120-5B', label: 'HITACHI ZX120-5B' },
    { value: 'HITACHI ZX120-E', label: 'HITACHI ZX120-E' },
    { value: 'HITACHI ZX130', label: 'HITACHI ZX130' },
    { value: 'HITACHI ZX130-3', label: 'HITACHI ZX130-3' },
    { value: 'HITACHI ZX130-5B', label: 'HITACHI ZX130-5B' },
    { value: 'HITACHI ZX130-5G', label: 'HITACHI ZX130-5G' },
    { value: 'HITACHI ZX130K', label: 'HITACHI ZX130K' },
    { value: 'HITACHI ZX130K-3', label: 'HITACHI ZX130K-3' },
    { value: 'HITACHI ZX130LCN', label: 'HITACHI ZX130LCN' },
    { value: 'HITACHI ZX135US.', label: 'HITACHI ZX135US.' },
    { value: 'HITACHI ZX135US-3', label: 'HITACHI ZX135US-3' },
    { value: 'HITACHI ZX135US-5B', label: 'HITACHI ZX135US-5B' },
    { value: 'HITACHI ZX135US-6', label: 'HITACHI ZX135US-6' },
    { value: 'HITACHI ZX135US-E', label: 'HITACHI ZX135US-E' },
    { value: 'HITACHI ZX135USK', label: 'HITACHI ZX135USK' },
    { value: 'HITACHI ZX140H', label: 'HITACHI ZX140H' },
    { value: 'HITACHI ZX160-3', label: 'HITACHI ZX160-3' },
    { value: 'HITACHI ZX17U', label: 'HITACHI ZX17U' },
    { value: 'HITACHI ZX17U-2', label: 'HITACHI ZX17U-2' },
    { value: 'HITACHI ZX200', label: 'HITACHI ZX200' },
    { value: 'HITACHI ZX200-3', label: 'HITACHI ZX200-3' },
    { value: 'HITACHI ZX200-5B', label: 'HITACHI ZX200-5B' },
    { value: 'HITACHI ZX200-5G', label: 'HITACHI ZX200-5G' },
    { value: 'HITACHI ZX200-6', label: 'HITACHI ZX200-6' },
    { value: 'HITACHI ZX200LC', label: 'HITACHI ZX200LC' },
    { value: 'HITACHI ZX200LC-3', label: 'HITACHI ZX200LC-3' },
    { value: 'HITACHI ZX200LC-5G', label: 'HITACHI ZX200LC-5G' },
    { value: 'HITACHI ZX210-6', label: 'HITACHI ZX210-6' },
    { value: 'HITACHI ZX210H-3', label: 'HITACHI ZX210H-3' },
    { value: 'HITACHI ZX210K', label: 'HITACHI ZX210K' },
    { value: 'HITACHI ZX210K-3', label: 'HITACHI ZX210K-3' },
    { value: 'HITACHI ZX210K-5B', label: 'HITACHI ZX210K-5B' },
    { value: 'HITACHI ZX210LC', label: 'HITACHI ZX210LC' },
    { value: 'HITACHI ZX210LC-3', label: 'HITACHI ZX210LC-3' },
    { value: 'HITACHI ZX210LC-5B', label: 'HITACHI ZX210LC-5B' },
    { value: 'HITACHI ZX210LC-5G', label: 'HITACHI ZX210LC-5G' },
    { value: 'HITACHI ZX210LCH-5B', label: 'HITACHI ZX210LCH-5B' },
    { value: 'HITACHI ZX210LCH-5G', label: 'HITACHI ZX210LCH-5G' },
    { value: 'HITACHI ZX220LC-GI', label: 'HITACHI ZX220LC-GI' },
    { value: 'HITACHI ZX225US', label: 'HITACHI ZX225US' },
    { value: 'HITACHI ZX225US-3', label: 'HITACHI ZX225US-3' },
    { value: 'HITACHI ZX225US-5B', label: 'HITACHI ZX225US-5B' },
    { value: 'HITACHI ZX225USR-3', label: 'HITACHI ZX225USR-3' },
    { value: 'HITACHI ZX270-3', label: 'HITACHI ZX270-3' },
    { value: 'HITACHI ZX270LC', label: 'HITACHI ZX270LC' },
    { value: 'HITACHI ZX270LC-3', label: 'HITACHI ZX270LC-3' },
    { value: 'HITACHI ZX30U', label: 'HITACHI ZX30U' },
    { value: 'HITACHI ZX30U-2', label: 'HITACHI ZX30U-2' },
    { value: 'HITACHI ZX30U-3', label: 'HITACHI ZX30U-3' },
    { value: 'HITACHI ZX30U-5A', label: 'HITACHI ZX30U-5A' },
    { value: 'HITACHI ZX330LC', label: 'HITACHI ZX330LC' },
    { value: 'HITACHI ZX35', label: 'HITACHI ZX35' },
    { value: 'HITACHI ZX350H', label: 'HITACHI ZX350H' },
    { value: 'HITACHI ZX350H-5B', label: 'HITACHI ZX350H-5B' },
    { value: 'HITACHI ZX350LC', label: 'HITACHI ZX350LC' },
    { value: 'HITACHI ZX350LC-3', label: 'HITACHI ZX350LC-3' },
    { value: 'HITACHI ZX350LC-5B', label: 'HITACHI ZX350LC-5B' },
    { value: 'HITACHI ZX350LC-6N', label: 'HITACHI ZX350LC-6N' },
    { value: 'HITACHI ZX35U', label: 'HITACHI ZX35U' },
    { value: 'HITACHI ZX35U-2', label: 'HITACHI ZX35U-2' },
    { value: 'HITACHI ZX35U-3', label: 'HITACHI ZX35U-3' },
    { value: 'HITACHI ZX35U-5A', label: 'HITACHI ZX35U-5A' },
    { value: 'HITACHI ZX370', label: 'HITACHI ZX370' },
    { value: 'HITACHI ZX40U', label: 'HITACHI ZX40U' },
    { value: 'HITACHI ZX40U-2', label: 'HITACHI ZX40U-2' },
    { value: 'HITACHI ZX40U-3', label: 'HITACHI ZX40U-3' },
    { value: 'HITACHI ZX40U-5A', label: 'HITACHI ZX40U-5A' },
    { value: 'HITACHI ZX40U-5B', label: 'HITACHI ZX40U-5B' },
    { value: 'HITACHI ZX40US-5B', label: 'HITACHI ZX40US-5B' },
    { value: 'HITACHI ZX450LC', label: 'HITACHI ZX450LC' },
    { value: 'HITACHI ZX450LC-3', label: 'HITACHI ZX450LC-3' },
    { value: 'HITACHI ZX50', label: 'HITACHI ZX50' },
    { value: 'HITACHI ZX50U', label: 'HITACHI ZX50U' },
    { value: 'HITACHI ZX50U-2', label: 'HITACHI ZX50U-2' },
    { value: 'HITACHI ZX50U-3', label: 'HITACHI ZX50U-3' },
    { value: 'HITACHI ZX50U-5A', label: 'HITACHI ZX50U-5A' },
    { value: 'HITACHI ZX50U-5B', label: 'HITACHI ZX50U-5B' },
    { value: 'HITACHI ZX55UR', label: 'HITACHI ZX55UR' },
    { value: 'HITACHI ZX70', label: 'HITACHI ZX70' },
    { value: 'HITACHI ZX70-3', label: 'HITACHI ZX70-3' },
    { value: 'HITACHI ZX75', label: 'HITACHI ZX75' },
    { value: 'HITACHI ZX75URT', label: 'HITACHI ZX75URT' },
    { value: 'HITACHI ZX75US', label: 'HITACHI ZX75US' },
    { value: 'HITACHI ZX75US-3', label: 'HITACHI ZX75US-3' },
    { value: 'HITACHI ZX75US-5B', label: 'HITACHI ZX75US-5B' },
    { value: 'HITACHI ZX75US-A', label: 'HITACHI ZX75US-A' },
    { value: 'HITACHI ZX75USK-3', label: 'HITACHI ZX75USK-3' },
    { value: 'HITACHI ZX75USK-5B', label: 'HITACHI ZX75USK-5B' },
    { value: 'HITACHI ZX80', label: 'HITACHI ZX80' },
    { value: 'HITACHI ZX80GI', label: 'HITACHI ZX80GI' },
    { value: 'HITACHI ZX80LCK', label: 'HITACHI ZX80LCK' },
    { value: 'HITACHI ZX890LCH-6', label: 'HITACHI ZX890LCH-6' },
    { value: 'INGERSOLL RAND DD24', label: 'INGERSOLL RAND DD24' },
    { value: 'INGERSOLL RAND DD-24', label: 'INGERSOLL RAND DD-24' },
    { value: 'INGERSOLL RAND L6/L8', label: 'INGERSOLL RAND L6/L8' },
    { value: 'INGERSOLL RAND SD100D', label: 'INGERSOLL RAND SD100D' },
    { value: 'INGERSOLL RAND SD116D', label: 'INGERSOLL RAND SD116D' },
    { value: 'INGERSOLL RAND SD70D', label: 'INGERSOLL RAND SD70D' },
    { value: 'INGERSOLL RAND SD77F', label: 'INGERSOLL RAND SD77F' },
    { value: 'INTERNATIONAL 4300SBA', label: 'INTERNATIONAL 4300SBA' },
    { value: 'INTERNATIONAL 7600', label: 'INTERNATIONAL 7600' },
    { value: 'INTERNATIONAL CARROTANQUE PARA AGUA', label: 'INTERNATIONAL CARROTANQUE PARA AGUA' },
    { value: 'INTERNATIONAL DT4300', label: 'INTERNATIONAL DT4300' },
    { value: 'INTERNATIONAL GRUA HIDRAULICA INTERNACIONAL', label: 'INTERNATIONAL GRUA HIDRAULICA INTERNACIONAL' },
    { value: 'INTERNATIONAL JKY 190', label: 'INTERNATIONAL JKY 190' },
    { value: 'INTERNATIONAL JKY191', label: 'INTERNATIONAL JKY191' },
    { value: 'INTERNATIONAL LT625 6X4', label: 'INTERNATIONAL LT625 6X4' },
    { value: 'INTERNATIONAL MV607', label: 'INTERNATIONAL MV607' },
    { value: 'INTERNATIONAL PROSTAR122-6X4', label: 'INTERNATIONAL PROSTAR122-6X4' },
    { value: 'INTERNATIONAL SG500', label: 'INTERNATIONAL SG500' },
    { value: 'INTERNATIONAL WORKSTAR', label: 'INTERNATIONAL WORKSTAR' },
    { value: 'ISUZU 4JG 1', label: 'ISUZU 4JG 1' },
    { value: 'ISUZU 4JG1', label: 'ISUZU 4JG1' },
    { value: 'ISUZU 4JJ1', label: 'ISUZU 4JJ1' },
    { value: 'ISUZU 4LE', label: 'ISUZU 4LE' },
    { value: 'ISUZU 6BT', label: 'ISUZU 6BT' },
    { value: 'ISUZU ISUZU 4HK1', label: 'ISUZU ISUZU 4HK1' },
    { value: 'ISUZU ISUZU 6HK', label: 'ISUZU ISUZU 6HK' },
    { value: 'JCB 180JCB', label: 'JCB 180JCB' },
    { value: 'JCB 190JCB', label: 'JCB 190JCB' },
    { value: 'JCB JS200LC', label: 'JCB JS200LC' },
    { value: 'JCB VMT260', label: 'JCB VMT260' },
    { value: 'JOHN DEERE 270CLC', label: 'JOHN DEERE 270CLC' },
    { value: 'JOHN DEERE 310G', label: 'JOHN DEERE 310G' },
    { value: 'JOHN DEERE 310L', label: 'JOHN DEERE 310L' },
    { value: 'JOHN DEERE 310L.', label: 'JOHN DEERE 310L.' },
    { value: 'JOHN DEERE 320', label: 'JOHN DEERE 320' },
    { value: 'JOHN DEERE 320D', label: 'JOHN DEERE 320D' },
    { value: 'JOHN DEERE 35D', label: 'JOHN DEERE 35D' },
    { value: 'JOHN DEERE 410J', label: 'JOHN DEERE 410J' },
    { value: 'JOHN DEERE 416', label: 'JOHN DEERE 416' },
    { value: 'JOHN DEERE 50D', label: 'JOHN DEERE 50D' },
    { value: 'JOHN DEERE 510', label: 'JOHN DEERE 510' },
    { value: 'JOHN DEERE 595D', label: 'JOHN DEERE 595D' },
    { value: 'JOHN DEERE 670D', label: 'JOHN DEERE 670D' },
    { value: 'JOHN DEERE 450', label: 'JOHN DEERE 450' },
    { value: 'JOHN DEERE 550', label: 'JOHN DEERE 550' },
    { value: 'JOHN DEERE 650', label: 'JOHN DEERE 650' },
    { value: 'JOHN DEERE 700J', label: 'JOHN DEERE 700J' },
    { value: 'JOHN DEERE 700JXLT', label: 'JOHN DEERE 700JXLT' },
    { value: 'JOHN DEERE 850J', label: 'JOHN DEERE 850J' },
    { value: 'JOHN DEERE 950', label: 'JOHN DEERE 950' },
    { value: 'JOHN DEERE 1050', label: 'JOHN DEERE 1050' },
    { value: 'KATO HD308US', label: 'KATO HD308US' },
    { value: 'KENWORTH KENWORTH T800', label: 'KENWORTH KENWORTH T800' },
    { value: 'KENWORTH T-800', label: 'KENWORTH T-800' },
    { value: 'KING 866H', label: 'KING 866H' },
    { value: 'KING 866HTC', label: 'KING 866HTC' },
    { value: 'KIPOR KDE3500T', label: 'KIPOR KDE3500T' },
    { value: 'KOBELCO D65EX-15E', label: 'KOBELCO D65EX-15E' },
    { value: 'KOBELCO SK200-6', label: 'KOBELCO SK200-6' },
    { value: 'KOBELCO SK200-8', label: 'KOBELCO SK200-8' },
    { value: 'KOBELCO SK210LC', label: 'KOBELCO SK210LC' },
    { value: 'KOBELCO SK210LC-8', label: 'KOBELCO SK210LC-8' },
    { value: 'KOBELCO SK290LC', label: 'KOBELCO SK290LC' },
    { value: 'KOBELCO SK300LC', label: 'KOBELCO SK300LC' },
    { value: 'KOBELCO SK30LC', label: 'KOBELCO SK30LC' },
    { value: 'KOBELCO SK330', label: 'KOBELCO SK330' },
    { value: 'KOBELCO SK35', label: 'KOBELCO SK35' },
    { value: 'KOMATSU 65B', label: 'KOMATSU 65B' },
    { value: 'KOMATSU D100A', label: 'KOMATSU D100A' },
    { value: 'KOMATSU D39PX-21', label: 'KOMATSU D39PX-21' },
    { value: 'KOMATSU D65E-8', label: 'KOMATSU D65E-8' },
    { value: 'KOMATSU FD30T-16', label: 'KOMATSU FD30T-16' },
    { value: 'KOMATSU PC130-8', label: 'KOMATSU PC130-8' },
    { value: 'KOMATSU PC200-6', label: 'KOMATSU PC200-6' },
    { value: 'KOMATSU PC200-7', label: 'KOMATSU PC200-7' },
    { value: 'KOMATSU PC200-8', label: 'KOMATSU PC200-8' },
    { value: 'KOMATSU PC220', label: 'KOMATSU PC220' },
    { value: 'KOMATSU PC300LC-7L', label: 'KOMATSU PC300LC-7L' },
    { value: 'KOMATSU WA180-1', label: 'KOMATSU WA180-1' },
    { value: 'K-TRACTOR WINGS', label: 'K-TRACTOR WINGS' },
    { value: 'K-TECHNOLOGY', label: 'K-TECHNOLOGY' },
    { value: 'K-TECHPOWER', label: 'K-TECHPOWER' },
    { value: 'KUBOTA 7100', label: 'KUBOTA 7100' },
    { value: 'KUBOTA 75', label: 'KUBOTA 75' },
    { value: 'KUBOTA 9540', label: 'KUBOTA 9540' },
    { value: 'KUBOTA B2320', label: 'KUBOTA B2320' },
    { value: 'KUBOTA K-120-3', label: 'KUBOTA K-120-3' },
    { value: 'KUBOTA K-70-3', label: 'KUBOTA K-70-3' },
    { value: 'KUBOTA K-75US-A', label: 'KUBOTA K-75US-A' },
    { value: 'KUBOTA L4400', label: 'KUBOTA L4400' },
    { value: 'KUBOTA M9540', label: 'KUBOTA M9540' },
    { value: 'KUBOTA R530Z', label: 'KUBOTA R530Z' },
    { value: 'KUBOTA TRACTOR', label: 'KUBOTA TRACTOR' },
    { value: 'LINK BELT 1300X2', label: 'LINK BELT 1300X2' },
    { value: 'LINK BELT 130X2', label: 'LINK BELT 130X2' },
    { value: 'LINK BELT 130X2LC', label: 'LINK BELT 130X2LC' },
    { value: 'LINK BELT 130X3E', label: 'LINK BELT 130X3E' },
    { value: 'LINK BELT 145X4', label: 'LINK BELT 145X4' },
    { value: 'LINK BELT 160X2', label: 'LINK BELT 160X2' },
    { value: 'LINK BELT 210X2', label: 'LINK BELT 210X2' },
    { value: 'LINK BELT 210X3E', label: 'LINK BELT 210X3E' },
    { value: 'LINK BELT 240X2', label: 'LINK BELT 240X2' },
    { value: 'LINK BELT 250X3E', label: 'LINK BELT 250X3E' },
    { value: 'LINK BELT 290X2', label: 'LINK BELT 290X2' },
    { value: 'LINK BELT 300X3E', label: 'LINK BELT 300X3E' },
    { value: 'LINK BELT 350X2', label: 'LINK BELT 350X2' },
    { value: 'LINK BELT 350X3', label: 'LINK BELT 350X3' },
    { value: 'LINK BELT 360X3E', label: 'LINK BELT 360X3E' },
    { value: 'LINK BELT 460X2', label: 'LINK BELT 460X2' },
    { value: 'LINK BELT 75 SPIN', label: 'LINK BELT 75 SPIN' },
    { value: 'LINK BELT 75MSR', label: 'LINK BELT 75MSR' },
    { value: 'LINK BELT 75SPIN', label: 'LINK BELT 75SPIN' },
    { value: 'LINK BELT 75X2', label: 'LINK BELT 75X2' },
    { value: 'LINK BELT 80SBL', label: 'LINK BELT 80SBL' },
    { value: 'LINK BELT LS98', label: 'LINK BELT LS98' },
    { value: 'LIUGONG 4180D', label: 'LIUGONG 4180D' },
    { value: 'LIUGONG 6612E', label: 'LIUGONG 6612E' },
    { value: 'LIUGONG 766A', label: 'LIUGONG 766A' },
    { value: 'LIUGONG 820H', label: 'LIUGONG 820H' },
    { value: 'LIUGONG 930E', label: 'LIUGONG 930E' },
    { value: 'LIUGONG 936E', label: 'LIUGONG 936E' },
    { value: 'LIUGONG CLG4165D', label: 'LIUGONG CLG4165D' },
    { value: 'LIUGONG CLG612H', label: 'LIUGONG CLG612H' },
    { value: 'LIUGONG CLG766A', label: 'LIUGONG CLG766A' },
    { value: 'LIUGONG CLG816C', label: 'LIUGONG CLG816C' },
    { value: 'LIUGONG CLG820C', label: 'LIUGONG CLG820C' },
    { value: 'LIUGONG CLG835H', label: 'LIUGONG CLG835H' },
    { value: 'LIUGONG CLG855H', label: 'LIUGONG CLG855H' },
    { value: 'LIUGONG CLG856H', label: 'LIUGONG CLG856H' },
    { value: 'LIUGONG CLG870H', label: 'LIUGONG CLG870H' },
    { value: 'LIUGONG CLG885H', label: 'LIUGONG CLG885H' },
    { value: 'LIUGONG CLG908E', label: 'LIUGONG CLG908E' },
    { value: 'LIUGONG CLG913E', label: 'LIUGONG CLG913E' },
    { value: 'LIUGONG CLG915E', label: 'LIUGONG CLG915E' },
    { value: 'LIUGONG CLG920E', label: 'LIUGONG CLG920E' },
    { value: 'LIUGONG CLG922D', label: 'LIUGONG CLG922D' },
    { value: 'LIUGONG CLG922E.', label: 'LIUGONG CLG922E.' },
    { value: 'LIUGONG CLG922F', label: 'LIUGONG CLG922F' },
    { value: 'LIUGONG CLG933D', label: 'LIUGONG CLG933D' },
    { value: 'LIUGONG CLG933EHD', label: 'LIUGONG CLG933EHD' },
    { value: 'LIUGONG F7035M', label: 'LIUGONG F7035M' },
    { value: 'LIUGONG KMX15RA', label: 'LIUGONG KMX15RA' },
    { value: 'LIUGONG ZL30E', label: 'LIUGONG ZL30E' },
    { value: 'MACK CX613', label: 'MACK CX613' },
    { value: 'MACK MACK', label: 'MACK MACK' },
    { value: 'MACK TFQ486', label: 'MACK TFQ486' },
    { value: 'MASALTA F16-4', label: 'MASALTA F16-4' },
    { value: 'MAZDA BT50', label: 'MAZDA BT50' },
    { value: 'MAZDA MAZDA', label: 'MAZDA MAZDA' },
    { value: 'MAZDA MAZDA 2', label: 'MAZDA MAZDA 2' },
    { value: 'MQ POWER BLW-400SSW', label: 'MQ POWER BLW-400SSW' },
    { value: 'MULTIQUIP CA150D', label: 'MULTIQUIP CA150D' },
    { value: 'MULTIQUIP CA150PD', label: 'MULTIQUIP CA150PD' },
    { value: 'MULTIQUIP CA250', label: 'MULTIQUIP CA250' },
    { value: 'MULTIQUIP CC135', label: 'MULTIQUIP CC135' },
    { value: 'MULTIQUIP CC135C', label: 'MULTIQUIP CC135C' },
    { value: 'MULTIQUIP PLANTA ELECTRICA MULTIQUIP400', label: 'MULTIQUIP PLANTA ELECTRICA MULTIQUIP400' },
    { value: 'MULTIQUIP RC45-3', label: 'MULTIQUIP RC45-3' },
    { value: 'NEW HOLLAND 6610S', label: 'NEW HOLLAND 6610S' },
    { value: 'NEW HOLLAND B110', label: 'NEW HOLLAND B110' },
    { value: 'NEW HOLLAND B95', label: 'NEW HOLLAND B95' },
    { value: 'NEW HOLLAND D170', label: 'NEW HOLLAND D170' },
    { value: 'NEW HOLLAND D85', label: 'NEW HOLLAND D85' },
    { value: 'NEW HOLLAND E215C', label: 'NEW HOLLAND E215C' },
    { value: 'NEW HOLLAND L220', label: 'NEW HOLLAND L220' },
    { value: 'NEW HOLLAND L223', label: 'NEW HOLLAND L223' },
    { value: 'NEW HOLLAND RG140', label: 'NEW HOLLAND RG140' },
    { value: 'NEW HOLLAND RG1408', label: 'NEW HOLLAND RG1408' },
    { value: 'NEW HOLLAND RG140B', label: 'NEW HOLLAND RG140B' },
    { value: 'NEW HOLLAND TL-90', label: 'NEW HOLLAND TL-90' },
    { value: 'NEW HOLLAND W190', label: 'NEW HOLLAND W190' },
    { value: 'NEW HOLLAND W270B', label: 'NEW HOLLAND W270B' },
    { value: 'NHB LS190B', label: 'NHB LS190B' },
    { value: 'NISSAN FRONTIER', label: 'NISSAN FRONTIER' },
    { value: 'OKADA FURUKAWA F5', label: 'OKADA FURUKAWA F5' },
    { value: 'OKADA MARTILLO CAT 305', label: 'OKADA MARTILLO CAT 305' },
    { value: 'OKADA MARTILLO NPK', label: 'OKADA MARTILLO NPK' },
    { value: 'OKADA OKADA1500', label: 'OKADA OKADA1500' },
    { value: 'OKADA OKADA2600', label: 'OKADA OKADA2600' },
    { value: 'OKADA OKADA3600', label: 'OKADA OKADA3600' },
    { value: 'OKADA OKADA400', label: 'OKADA OKADA400' },
    { value: 'OKADA OKADA800', label: 'OKADA OKADA800' },
    { value: 'OKADA TOP100A', label: 'OKADA TOP100A' },
    { value: 'OKADA TOP203', label: 'OKADA TOP203' },
    { value: 'OKADA TOP280', label: 'OKADA TOP280' },
    { value: 'OKADA TOP300', label: 'OKADA TOP300' },
    { value: 'OTROS BAR_VITSEDPAT', label: 'OTROS BAR_VITSEDPAT' },
    { value: 'OTROS BOG_VITSEDPAT', label: 'OTROS BOG_VITSEDPAT' },
    { value: 'OTROS CAL_VITSEDPAT', label: 'OTROS CAL_VITSEDPAT' },
    { value: 'OTROS MED_VITSEDPAT', label: 'OTROS MED_VITSEDPAT' },
    { value: 'PERKINS PLANTA ELECTRICA PERKINS YD50517', label: 'PERKINS PLANTA ELECTRICA PERKINS YD50517' },
    { value: 'POWERING PLANTA ELECTRICA POWERING 4D230G', label: 'POWERING PLANTA ELECTRICA POWERING 4D230G' },
    { value: 'RENAULT ALASKAN', label: 'RENAULT ALASKAN' },
    { value: 'RENAULT KANGOO', label: 'RENAULT KANGOO' },
    { value: 'RUBBLE MASTER CS3600', label: 'RUBBLE MASTER CS3600' },
    { value: 'RUBBLE MASTER HS5000', label: 'RUBBLE MASTER HS5000' },
    { value: 'RUBBLE MASTER RFB550GO!', label: 'RUBBLE MASTER RFB550GO!' },
    { value: 'RUBBLE MASTER RFB70GO!', label: 'RUBBLE MASTER RFB70GO!' },
    { value: 'RUBBLE MASTER RM MS100GO', label: 'RUBBLE MASTER RM MS100GO' },
    { value: 'RUBBLE MASTER RM OS70GO', label: 'RUBBLE MASTER RM OS70GO' },
    { value: 'RUBBLE MASTER RM OS80GO', label: 'RUBBLE MASTER RM OS80GO' },
    { value: 'RUBBLE MASTER RM70GO-1', label: 'RUBBLE MASTER RM70GO-1' },
    { value: 'RUBBLE MASTER RM80GO', label: 'RUBBLE MASTER RM80GO' },
    { value: 'RUBBLE MASTER RMV550GO!', label: 'RUBBLE MASTER RMV550GO!' },
    { value: 'SANY SY215C', label: 'SANY SY215C' },
    { value: 'SANY SHG190C', label: 'SANY SHG190C' },
    { value: 'SANY SY245C', label: 'SANY SY245C' },
    { value: 'SANY SY365C', label: 'SANY SY365C' },
    { value: 'SANY SY375C', label: 'SANY SY375C' },
    { value: 'SANY SY390C', label: 'SANY SY390C' },
    { value: 'SANY SY415C', label: 'SANY SY415C' },
    { value: 'SANY SY500C', label: 'SANY SY500C' },
    { value: 'SMT 50S', label: 'SMT 50S' },
    { value: 'SBM PE600X900', label: 'SBM PE600X900' },
    { value: 'SBM SBM 3Y1860', label: 'SBM SBM 3Y1860' },
    { value: 'SBM SBM KF121414-1', label: 'SBM SBM KF121414-1' },
    { value: 'SBM SBM PE600X900', label: 'SBM SBM PE600X900' },
    { value: 'SBM SBM PF1214', label: 'SBM SBM PF1214' },
    { value: 'SBM SBM PF1315', label: 'SBM SBM PF1315' },
    { value: 'SIMEX FRESADORA', label: 'SIMEX FRESADORA' },
    { value: 'SOOSAN SB121TS-P', label: 'SOOSAN SB121TS-P' },
    { value: 'SOOSAN SB35IITS-P', label: 'SOOSAN SB35IITS-P' },
    { value: 'SOOSAN SB35TS-P', label: 'SOOSAN SB35TS-P' },
    { value: 'SOOSAN SB43', label: 'SOOSAN SB43' },
    { value: 'SOOSAN SB50TS-P', label: 'SOOSAN SB50TS-P' },
    { value: 'SOOSAN SB70TS-P', label: 'SOOSAN SB70TS-P' },
    { value: 'SOOSAN SQ70', label: 'SOOSAN SQ70' },
    { value: 'STAMFORD PLANTA ELECTRICA AGG', label: 'STAMFORD PLANTA ELECTRICA AGG' },
    { value: 'STAMFORD PLANTA ELECTRICA STANDFORD', label: 'STAMFORD PLANTA ELECTRICA STANDFORD' },
    { value: 'SUMITOMO SH120', label: 'SUMITOMO SH120' },
    { value: 'SUMITOMO SH120-5', label: 'SUMITOMO SH120-5' },
    { value: 'SUMITOMO SH200', label: 'SUMITOMO SH200' },
    { value: 'SUMITOMO SH200-3', label: 'SUMITOMO SH200-3' },
    { value: 'SUMITOMO SH200-5', label: 'SUMITOMO SH200-5' },
    { value: 'SUMITOMO SH210-5', label: 'SUMITOMO SH210-5' },
    { value: 'SUMITOMO SH75X-3B', label: 'SUMITOMO SH75X-3B' },
    { value: 'SULLAIR 185', label: 'SULLAIR 185' },
    { value: 'SUZUKI GRAND VITARA', label: 'SUZUKI GRAND VITARA' },
    { value: 'SUZUKI JIMNY', label: 'SUZUKI JIMNY' },
    { value: 'TEREX 760B', label: 'TEREX 760B' },
    { value: 'TEREX PT60', label: 'TEREX PT60' },
    { value: 'TEREX RL40', label: 'TEREX RL40' },
    { value: 'TEREX TA30', label: 'TEREX TA30' },
    { value: 'TEREX TA300', label: 'TEREX TA300' },
    { value: 'TEREX TG140', label: 'TEREX TG140' },
    { value: 'TEREX TLB830', label: 'TEREX TLB830' },
    { value: 'TEREX TLB840SM', label: 'TEREX TLB840SM' },
    { value: 'TEREX TSR70', label: 'TEREX TSR70' },
    { value: 'TEREX TX760B', label: 'TEREX TX760B' },
    { value: 'TEREX TX760B-D', label: 'TEREX TX760B-D' },
    { value: 'TEREX TX760B-E', label: 'TEREX TX760B-E' },
    { value: 'TOYOTA 52-6FGCU45-BCS', label: 'TOYOTA 52-6FGCU45-BCS' },
    { value: 'TOYOTA 7FDKU40', label: 'TOYOTA 7FDKU40' },
    { value: 'TOYOTA 7FG35', label: 'TOYOTA 7FG35' },
    { value: 'TOYOTA 7FGCU45', label: 'TOYOTA 7FGCU45' },
    { value: 'TOYOTA 7FGCU-45', label: 'TOYOTA 7FGCU-45' },
    { value: 'TOYOTA 8FG15', label: 'TOYOTA 8FG15' },
    { value: 'TOYOTA 8FG18', label: 'TOYOTA 8FG18' },
    { value: 'TOYOTA FGZN25', label: 'TOYOTA FGZN25' },
    { value: 'TOYOTA HILUX', label: 'TOYOTA HILUX' },
    { value: 'VANTAGE PLANTA ELECTRICA VANTAGE 400', label: 'VANTAGE PLANTA ELECTRICA VANTAGE 400' },
    { value: 'VOLKSWAGEN VOLKSWAGEN CONSTELLATION', label: 'VOLKSWAGEN VOLKSWAGEN CONSTELLATION' },
    { value: 'VOLKSWAGEN VW17-220', label: 'VOLKSWAGEN VW17-220' },
    { value: 'VOLVO G710B', label: 'VOLVO G710B' },
    { value: 'VOLVO SD45D', label: 'VOLVO SD45D' },
    { value: 'WACKER NEUSON 3503', label: 'WACKER NEUSON 3503' },
    { value: 'WACKER NEUSON 50Z3', label: 'WACKER NEUSON 50Z3' },
    { value: 'WATERMASTER Classic V', label: 'WATERMASTER Classic V' },
    { value: 'WECAN WT-000006', label: 'WECAN WT-000006' },
    { value: 'WECAN WT-020272', label: 'WECAN WT-020272' },
    { value: 'WIRTGEN W100F', label: 'WIRTGEN W100F' },
    { value: 'WTC WTC305', label: 'WTC WTC305' },
    { value: 'YAMAHA FUERA DE BORDA', label: 'YAMAHA FUERA DE BORDA' },
    { value: 'YANMAR 3TNV88', label: 'YANMAR 3TNV88' },
    { value: 'YANMAR 3TNV88-GGHWC', label: 'YANMAR 3TNV88-GGHWC' },
    { value: 'YANMAR VIO17', label: 'YANMAR VIO17' },
    { value: 'YANMAR VIO17-1B', label: 'YANMAR VIO17-1B' },
    { value: 'YANMAR VIO17-A', label: 'YANMAR VIO17-A' },
    { value: 'YANMAR VIO35', label: 'YANMAR VIO35' },
    { value: 'YANMAR VIO35-6B', label: 'YANMAR VIO35-6B' },
    { value: 'YANMAR VIO35-7', label: 'YANMAR VIO35-7' },
    { value: 'YANMAR VIO35-B', label: 'YANMAR VIO35-B' },
    { value: 'YANMAR VIO38-6B', label: 'YANMAR VIO38-6B' },
    { value: 'YANMAR VIO40', label: 'YANMAR VIO40' },
    { value: 'YANMAR VIO40-3', label: 'YANMAR VIO40-3' },
    { value: 'YANMAR VIO40-5B', label: 'YANMAR VIO40-5B' },
    { value: 'YANMAR VIO45-6B', label: 'YANMAR VIO45-6B' },
    { value: 'YANMAR VIO50', label: 'YANMAR VIO50' },
    { value: 'YANMAR VIO50-6B', label: 'YANMAR VIO50-6B' },
    { value: 'YANMAR VIO55', label: 'YANMAR VIO55' },
    { value: 'YANMAR VIO55-6B', label: 'YANMAR VIO55-6B' },
    { value: 'YANMAR VIO70', label: 'YANMAR VIO70' },
    { value: 'YANMAR VIO70-3', label: 'YANMAR VIO70-3' },
    { value: 'YANMAR VIO80-1', label: 'YANMAR VIO80-1' },
    { value: 'ZETOR 7245', label: 'ZETOR 7245' },
    { value: 'OTRO', label: 'OTRO' },
  ];

  const statusOptions = [
    { value: 'CORRECTED', label: 'Corrected' },
    { value: 'PENDING', label: 'Pending' },
  ];

  useEffect(() => {
    if (isEditMode && reportResponse?.data && !initialized) {
      const r = reportResponse.data;
      setReportData({
        clientName: r.client_name || '',
        clientContact: '',
        machineType: r.machine_type || '',
        model: r.model || '',
        serialNumber: r.serial_number || '',
        hourmeter: r.hourmeter?.toString() || '',
        date: r.report_date ? new Date(r.report_date).toISOString().split('T')[0] : '',
        location: '',
        ott: r.ott || '',
        reasonOfService: r.reason_of_service || '',
        conclusions: r.conclusions || '',
        overallSuggestions: r.overall_suggestions || '',
      });
      
      const loadedComponents = (r.components || []).map((comp: any) => {
        let params: any[] = [];
        if (Array.isArray(comp.parameters)) {
          params = comp.parameters;
        } else if (typeof comp.parameters === 'string') {
          try {
            params = JSON.parse(comp.parameters);
            if (!Array.isArray(params)) params = [];
          } catch {
            params = [];
          }
        }
        
        let photos: Array<{ id: string; url: string; filename: string }> = [];
        if (Array.isArray(comp.photos)) {
          photos = comp.photos.map((p: any) => {
            if (typeof p === 'string') {
              // Si es una URL string, crear un objeto con información básica
              return {
                id: `temp_${Date.now()}_${Math.random()}`,
                url: p,
                filename: p.split('/').pop() || 'unknown.jpg'
              };
            }
            if (p.file_path) {
              const url = p.file_path.startsWith('http') ? p.file_path : `http://localhost:3001${p.file_path.startsWith('/') ? '' : '/'}${p.file_path}`;
              return {
                id: p.id || `temp_${Date.now()}_${Math.random()}`,
                url: url,
                filename: p.filename || p.original_name || 'unknown.jpg'
              };
            }
            if (p.filename) {
              return {
                id: p.id || `temp_${Date.now()}_${Math.random()}`,
                url: `http://localhost:3001/uploads/${p.filename}`,
                filename: p.filename
              };
            }
            return {
              id: `temp_${Date.now()}_${Math.random()}`,
              url: '',
              filename: 'unknown.jpg'
            };
          }).filter(p => p.url !== '');
        }
        
        return {
          ...comp,
          parameters: params,
          photos,
        };
      });
      
      setComponents(loadedComponents);
      setSuggestedParts(
        Array.isArray(r.suggested_parts)
          ? r.suggested_parts.map((p: any) => ({
              partNumber: p.part_number,
              description: p.description,
              quantity: p.quantity,
            }))
          : []
      );
      setInitialized(true);
    }
  }, [isEditMode, reportResponse, initialized]);

  const validateAllSteps = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Step 1 validation
    if (!reportData.clientName) newErrors.clientName = 'Client name is required';
    if (!reportData.machineType) newErrors.machineType = 'Machine type is required';
    if (!reportData.model) newErrors.model = 'Model is required';
    if (!reportData.serialNumber) newErrors.serialNumber = 'Serial number is required';
    if (!reportData.hourmeter) {
      newErrors.hourmeter = 'Hourmeter reading is required';
    } else if (isNaN(Number(reportData.hourmeter))) {
      newErrors.hourmeter = 'Hourmeter must be a valid number';
    }
    if (!reportData.ott) newErrors.ott = 'OTT is required';
    if (!reportData.reasonOfService) newErrors.reasonOfService = 'Reason of service is required';

    // Step 2 validation
    if (components.length === 0) {
      newErrors.components = 'At least one component assessment is required';
    } else {
      components.forEach((comp, index) => {
        if (!comp.findings) {
          newErrors[`component_${index}_findings`] = `Findings are required for component ${index + 1}`;
        }
      });
    }

    // Validate total number of photos
    const totalPhotos = components.reduce((total, comp) => {
      const newPhotos = comp.photos.filter(p => p instanceof File).length;
      return total + newPhotos;
    }, 0);
    
    if (totalPhotos > 100) {
      newErrors.photos = 'Too many photos. Maximum is 100 photos per report.';
    }

    // Step 3 validation
    if (!reportData.conclusions) newErrors.conclusions = 'Conclusions are required';
    
    // Step 4 (suggested parts) validation
    suggestedParts.forEach((part, index) => {
      if (!part.partNumber) {
        newErrors[`part_${index}_partNumber`] = `Part number is required for part ${index + 1}`;
      }
      if (!part.description) {
        newErrors[`part_${index}_description`] = `Description is required for part ${index + 1}`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!reportData.clientName) newErrors.clientName = 'Client name is required';
      if (!reportData.machineType) newErrors.machineType = 'Machine type is required';
      if (!reportData.model) newErrors.model = 'Model is required';
      if (!reportData.serialNumber) newErrors.serialNumber = 'Serial number is required';
      if (!reportData.hourmeter) {
        newErrors.hourmeter = 'Hourmeter reading is required';
      } else if (isNaN(Number(reportData.hourmeter))) {
        newErrors.hourmeter = 'Hourmeter must be a valid number';
      }
      if (!reportData.ott) newErrors.ott = 'OTT is required';
      if (!reportData.reasonOfService) newErrors.reasonOfService = 'Reason of service is required';
    } else if (step === 2) {
      if (components.length === 0) {
        newErrors.components = 'At least one component assessment is required';
      }
    } else if (step === 3) {
      if (!reportData.conclusions) newErrors.conclusions = 'Conclusions are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const addComponent = () => {
    const defaultType = componentTypes.length > 0 ? componentTypes[0].name : '';
    setComponents(prev => [...prev, {
      type: defaultType,
      findings: '',
      parameters: [],
      status: 'PENDING',
      suggestions: '',
      photos: [],
      priority: 'MEDIUM',
    }]);
  };

  const updateComponent = (index: number, field: string, value: any) => {
    setComponents(prev => prev.map((comp, i) => 
      i === index ? { ...comp, [field]: value } : comp
    ));
  };

  const removeComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
  };

  const addPart = () => {
    setSuggestedParts(prev => [...prev, {
      partNumber: '',
      description: '',
      quantity: 1,
    }]);
  };

  const updatePart = (index: number, field: keyof typeof suggestedParts[0], value: any) => {
    setSuggestedParts(prev => prev.map((part, i) => 
      i === index ? { ...part, [field]: value } : part
    ));
  };

  const removePart = (index: number) => {
    setSuggestedParts(prev => prev.filter((_, i) => i !== index));
  };

  const addParameter = (componentIdx: number) => {
    setComponents(prev => prev.map((comp, i) =>
      i === componentIdx
        ? { ...comp, parameters: [...(comp.parameters || []), { name: '', minValue: 0, maxValue: 0, measuredValue: 0, corrected: false, observation: '' }] }
        : comp
    ));
  };

  const updateParameter = (componentIdx: number, paramIdx: number, field: string, value: any) => {
    setComponents(prev => prev.map((comp, i) => {
      if (i !== componentIdx) return comp;
      const newParams = (comp.parameters || []).map((param, j) =>
        j === paramIdx ? { ...param, [field]: value } : param
      );
      return { ...comp, parameters: newParams };
    }));
  };

  const removeParameter = (componentIdx: number, paramIdx: number) => {
    const newComponents = [...components];
    newComponents[componentIdx].parameters = newComponents[componentIdx].parameters?.filter((_, i) => i !== paramIdx);
    setComponents(newComponents);
  };

  const deleteExistingPhoto = async (photoId: string) => {
    try {
      await apiService.deletePhoto(photoId);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  };

  const updatePhotoName = async (photoId: string, newName: string) => {
    try {
      await apiService.updatePhotoName(photoId, newName);
    } catch (error) {
      console.error('Error updating photo name:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateAllSteps()) {
      // Find the first step with an error and go to it
      if (errors.clientName || errors.machineType || errors.model || errors.serialNumber || errors.hourmeter || errors.ott) {
        setCurrentStep(1);
      } else if (errors.components || Object.keys(errors).some(k => k.startsWith('component_'))) {
        setCurrentStep(2);
      } else if (errors.conclusions || Object.keys(errors).some(k => k.startsWith('part_'))) {
        setCurrentStep(3);
      }
      return;
    }

    if (!authState.user) {
      setErrors({ submit: 'User not authenticated' });
      return;
    }

    try {
      const reportJson = {
        client_name: reportData.clientName,
        machine_type: reportData.machineType,
        model: reportData.model,
        serial_number: reportData.serialNumber,
        hourmeter: Number(reportData.hourmeter),
        report_date: reportData.date,
        ott: reportData.ott,
        reason_of_service: reportData.reasonOfService,
        conclusions: reportData.conclusions,
        overall_suggestions: reportData.overallSuggestions,
        status: isEditMode ? (reportResponse?.data?.status || 'draft') : 'draft',
        components: components.map(c => ({
          id: c.id,
          type: c.type,
          findings: c.findings,
          parameters: c.parameters,
          status: c.status,
          suggestions: c.suggestions,
          priority: c.priority,
          photos: c.photos.map(p => {
            if (p instanceof File) {
              // Para nuevas fotos (File), enviar null para que el backend las procese
              return null;
            }
            // Para fotos existentes, enviar la URL completa
            return p.url;
          }).filter(p => p !== null),
        })),
        suggested_parts: suggestedParts.map(p => ({
          part_number: p.partNumber,
          description: p.description,
          quantity: Number(p.quantity) || 1
        })),
      };

      if (!reportJson || typeof reportJson !== 'object') {
        setErrors({ submit: 'Invalid report data. Please refresh and try again.' });
        return;
      }

      const formData = new FormData();
      formData.append('reportData', JSON.stringify(reportJson));

      // Add photos to form data
      components.forEach((component, componentIndex) => {
        component.photos.forEach((photo) => {
          if (photo instanceof File) {
            formData.append(`photos_${componentIndex}`, photo);
          }
        });
      });

      if (isEditMode && id) {
        await updateReportMutation.mutateAsync({ id, updates: formData });
      } else {
        await createReportMutation.mutateAsync(formData);
      }

      navigate('/reports');
    } catch (error) {
      console.error('Error saving report:', error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not authorized') || error.message.includes('not found')) {
          setErrors({ submit: 'You are not authorized to edit this report or the report was not found.' });
        } else if (error.message.includes('CLOSED')) {
          setErrors({ submit: 'This report is closed and cannot be edited.' });
        } else if (error.message.includes('Request too large') || error.message.includes('413')) {
          setErrors({ submit: 'The request is too large. Please reduce the number of photos (max 20) or compress them more (max 1MB each).' });
        } else if (error.message.includes('Too many files')) {
          setErrors({ submit: 'Too many photos. Maximum is 20 photos per request. Please upload in smaller batches.' });
        } else if (error.message.includes('File too large')) {
          setErrors({ submit: 'One or more photos are too large. Maximum size is 1MB per photo. Please compress your images before uploading.' });
        } else if (error.message.includes('Failed to parse response')) {
          setErrors({ submit: 'Server error. Please try again with fewer photos or contact support.' });
        } else {
          setErrors({ submit: `Error saving report: ${error.message}` });
        }
      } else {
        setErrors({ submit: 'Error saving report. Please try again.' });
      }
    }
  };

  if (isLoadingReport) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-8 min-h-[400px]">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Header Section</h2>
        <p className="text-slate-600 mt-1">Fill in the basic information about the machinery inspection</p>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="Client Name"
              value={reportData.clientName}
              onChange={(e) => setReportData(prev => ({ ...prev, clientName: e.target.value }))}
              error={errors.clientName}
              placeholder="Enter client name"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Select
              label="Machine Type"
              options={machineTypeOptions}
              value={reportData.machineType}
              onChange={(e) => setReportData(prev => ({ ...prev, machineType: e.target.value }))}
              error={errors.machineType}
              placeholder="Select machine type"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Select
              label="Model"
              options={modelOptions}
              value={reportData.model}
              onChange={(e) => setReportData(prev => ({ ...prev, model: e.target.value }))}
              error={errors.model}
              placeholder="Select model"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="Serial Number"
              value={reportData.serialNumber}
              onChange={(e) => setReportData(prev => ({ ...prev, serialNumber: e.target.value }))}
              error={errors.serialNumber}
              placeholder="Enter serial number"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="Hourmeter"
              type="number"
              value={reportData.hourmeter}
              onChange={(e) => setReportData(prev => ({ ...prev, hourmeter: e.target.value }))}
              error={errors.hourmeter}
              placeholder="Enter hourmeter reading"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="Report Date"
              type="date"
              value={reportData.date}
              onChange={(e) => setReportData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="OTT"
              value={reportData.ott}
              onChange={(e) => setReportData(prev => ({ ...prev, ott: e.target.value }))}
              error={errors.ott}
              placeholder="Enter OTT"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Textarea
              label="Reason of Service"
              value={reportData.reasonOfService}
              onChange={(e) => setReportData(prev => ({ ...prev, reasonOfService: e.target.value }))}
              error={errors.reasonOfService}
              placeholder="Enter the reason for the service"
              rows={4}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 min-h-[400px]">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Component Assessment</h2>
        <p className="text-slate-600 mt-1">Assess the condition of each component</p>
      </div>

      {errors.components && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{errors.components}</p>
          </div>
        </div>
      )}

      {errors.photos && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{errors.photos}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {components.map((component, index) => (
          <div key={index} className="bg-slate-50 rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Component {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeComponent(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                label="Component Selection"
                options={componentTypeOptions}
                value={component.type}
                onChange={(e) => updateComponent(index, 'type', e.target.value)}
                required
              />
              <Select
                label="Status"
                options={statusOptions}
                value={component.status}
                onChange={(e) => updateComponent(index, 'status', e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <Textarea
                label="Findings"
                value={component.findings}
                onChange={(e) => updateComponent(index, 'findings', e.target.value)}
                error={errors[`component_${index}_findings`]}
                placeholder="Describe the findings for this component"
                required
              />

              {/* Parameters Table */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold text-slate-800">Parameters</h4>
                  <Button type="button" size="sm" variant="outline" onClick={() => addParameter(index)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Parameter
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Min Value</th>
                        <th className="border px-2 py-1">Max Value</th>
                        <th className="border px-2 py-1">Measured Value</th>
                        <th className="border px-2 py-1">Corrected</th>
                        <th className="border px-2 py-1">Observation</th>
                        <th className="border px-2 py-1">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(component.parameters || []).map((param, paramIdx) => (
                        <tr key={paramIdx}>
                          <td className="border px-2 py-1">
                            <Input
                              value={param.name}
                              onChange={e => updateParameter(index, paramIdx, 'name', e.target.value)}
                              placeholder="Parameter name"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              type="number"
                              value={param.minValue}
                              onChange={e => updateParameter(index, paramIdx, 'minValue', Number(e.target.value))}
                              placeholder="Min"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              type="number"
                              value={param.maxValue}
                              onChange={e => updateParameter(index, paramIdx, 'maxValue', Number(e.target.value))}
                              placeholder="Max"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              type="number"
                              value={param.measuredValue}
                              onChange={e => updateParameter(index, paramIdx, 'measuredValue', Number(e.target.value))}
                              placeholder="Measured"
                            />
                          </td>
                          <td className="border px-2 py-1 text-center">
                            <input
                              type="checkbox"
                              checked={param.corrected}
                              onChange={e => updateParameter(index, paramIdx, 'corrected', e.target.checked)}
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={param.observation}
                              onChange={e => updateParameter(index, paramIdx, 'observation', e.target.value)}
                              placeholder="Observation"
                            />
                          </td>
                          <td className="border px-2 py-1 text-center">
                            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => removeParameter(index, paramIdx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(component.parameters || []).length === 0 && (
                    <div className="text-slate-400 text-xs py-2 text-center">No parameters added</div>
                  )}
                </div>
              </div>

              <Textarea
                label="Suggestions"
                value={component.suggestions || ''}
                onChange={(e) => updateComponent(index, 'suggestions', e.target.value)}
                placeholder="Provide suggestions for this component"
              />

              {/* Photo Upload Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Photo Upload Guidelines:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Maximum 1MB per photo (images will be automatically compressed)</li>
                      <li>• Maximum 20 photos per request</li>
                      <li>• Supported formats: JPEG, PNG, GIF, WebP</li>
                      <li>• Photos will be resized to 800px max width/height</li>
                    </ul>
                  </div>
                </div>
              </div>

              <PhotoUpload
                label="Photos"
                photos={component.photos}
                onPhotosChange={(photos) => updateComponent(index, 'photos', photos)}
                onDeleteExistingPhoto={deleteExistingPhoto}
                onPhotoNameChange={updatePhotoName}
              />
            </div>
          </div>
        ))}
      </div>

      <Button onClick={addComponent} variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Component
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 min-h-[400px]">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Conclusions & Parts</h2>
        <p className="text-slate-600 mt-1">Provide conclusions and suggested parts</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="space-y-6">
          <Textarea
            label="Conclusions"
            value={reportData.conclusions}
            onChange={(e) => setReportData(prev => ({ ...prev, conclusions: e.target.value }))}
            error={errors.conclusions}
            placeholder="Provide overall conclusions about the machinery inspection"
            required
          />

          <Textarea
            label="Overall Suggestions"
            value={reportData.overallSuggestions}
            onChange={(e) => setReportData(prev => ({ ...prev, overallSuggestions: e.target.value }))}
            placeholder="Provide overall suggestions for the machinery"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">Suggested Parts and Activities</h3>
          <Button onClick={addPart} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>

        <div className="space-y-4">
          {suggestedParts.map((part, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Part Number"
                  value={part.partNumber}
                  onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                  error={errors[`part_${index}_partNumber`]}
                />
                <Input
                  placeholder="Description"
                  value={part.description}
                  onChange={(e) => updatePart(index, 'description', e.target.value)}
                  error={errors[`part_${index}_description`]}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={part.quantity.toString()}
                  onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePart(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditMode ? 'Edit Report' : 'New Report'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditMode ? 'Update the technical inspection report' : 'Create a new technical inspection report'}
          </p>
        </div>

        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-slate-600">
            <span>Header</span>
            <span>Components</span>
            <span>Conclusions</span>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-4">
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createReportMutation.isPending || updateReportMutation.isPending}
              >
                {createReportMutation.isPending || updateReportMutation.isPending ? (
                  <LoadingSpinner />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isEditMode ? 'Update Report' : 'Save Report'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};