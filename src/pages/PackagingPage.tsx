import React, { useState, useEffect } from 'react';
import { packagingRegistry } from '../backend/packaging/registry';
import { logisticsRegistry } from '../backend/logistics/registry';
import { returnablesRegistry } from '../backend/returnables/registry';
import { 
  PackagingProject, 
  PackagingMaterial, 
  PackagingAuditLog, 
  PackagingRole,
  PackagingComponent,
  MaterialStandard,
  PackagingDesign,
  ValidationRule,
  ValidationRun
} from '../backend/packaging/types';
import { PackagingSidebar } from '../components/packaging/PackagingSidebar';
import { PackagingHeader } from '../components/packaging/PackagingHeader';
import { PackagingWorkspace } from '../components/packaging/PackagingWorkspace';
import { eventBus } from '../core';

export const PackagingPage: React.FC = () => {
  // Local state mirrored from PackagingRegistry singleton
  const [projects, setProjects] = useState<PackagingProject[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [components, setComponents] = useState<PackagingComponent[]>([]);
  const [standards, setStandards] = useState<MaterialStandard[]>([]);
  const [designs, setDesigns] = useState<PackagingDesign[]>([]);
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [validationRuns, setValidationRuns] = useState<ValidationRun[]>([]);
  const [auditLogs, setAuditLogs] = useState<PackagingAuditLog[]>([]);
  const [role, setRole] = useState<PackagingRole>('Packaging Engineer');
  const [department, setDepartment] = useState('Industrial Packaging');
  const [returnablesCount, setReturnablesCount] = useState<number>(0);

  // Search & Faceted Filter states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Synchronize state from singleton
  const refreshRegistryState = () => {
    setProjects(packagingRegistry.getProjects());
    setMaterials(packagingRegistry.getMaterials());
    setComponents(packagingRegistry.getComponents());
    setStandards(packagingRegistry.getStandards());
    setDesigns(packagingRegistry.getDesigns());
    setRules(packagingRegistry.getRules());
    setValidationRuns(packagingRegistry.getValidationRuns());
    setAuditLogs(packagingRegistry.getAuditLogs());
    setRole(packagingRegistry.getCurrentRole());
    setDepartment(packagingRegistry.getCurrentDepartment());
    setReturnablesCount(returnablesRegistry.getAssets().length);
  };

  useEffect(() => {
    refreshRegistryState();

    // Listen to command center executions
    const sub = eventBus.subscribe('CMD_PACKAGING', (data: any) => {
      const cmd = data?.command;
      if (cmd === 'open-packaging-studio') {
        setActiveTab('dashboard');
      } else if (cmd === 'create-packaging-project') {
        setActiveTab('projects');
        const clickEvent = new CustomEvent('jnas-trigger-create-packaging');
        window.dispatchEvent(clickEvent);
      } else if (cmd === 'search-packaging') {
        setActiveTab('projects');
        setSearchQuery('');
      } else if (cmd === 'recent-packaging-projects') {
        setActiveTab('dashboard');
      } else if (cmd === 'packaging-dashboard') {
        setActiveTab('dashboard');
      } else if (cmd === 'material-library') {
        setActiveTab('materials');
      } else if (cmd === 'create-material') {
        setActiveTab('materials');
        setTimeout(() => {
          const clickEvent = new CustomEvent('jnas-trigger-create-material');
          window.dispatchEvent(clickEvent);
        }, 100);
      } else if (cmd === 'open-material' || cmd === 'search-material') {
        setActiveTab('materials');
      } else if (cmd === 'recent-materials') {
        setActiveTab('materials');
      } else if (cmd === 'favorite-materials') {
        setActiveTab('materials');
        setTimeout(() => {
          const clickEvent = new CustomEvent('jnas-trigger-fav-materials');
          window.dispatchEvent(clickEvent);
        }, 100);
      } else if (cmd === 'create-packaging-design') {
        setActiveTab('designs');
        setTimeout(() => {
          const clickEvent = new CustomEvent('jnas-trigger-create-design');
          window.dispatchEvent(clickEvent);
        }, 100);
      } else if (cmd === 'open-packaging-design' || cmd === 'search-designs') {
        setActiveTab('designs');
      } else if (cmd === 'recent-designs') {
        setActiveTab('designs');
      } else if (cmd === 'favorite-designs') {
        setActiveTab('designs');
        setTimeout(() => {
          const clickEvent = new CustomEvent('jnas-trigger-fav-designs');
          window.dispatchEvent(clickEvent);
        }, 100);
      } else if (cmd === 'open-validation' || cmd === 'run-validation' || cmd === 'validation-registry' || cmd === 'open-validation-rules') {
        setActiveTab('rules');
      } else if (cmd === 'load-planning-registry' || cmd === 'container-library' || cmd === 'logistics-dashboard') {
        setActiveTab('logistics');
      } else if (cmd === 'create-load-plan') {
        setActiveTab('logistics');
        setTimeout(() => {
          const clickEvent = new CustomEvent('jnas-trigger-create-loadplan');
          window.dispatchEvent(clickEvent);
        }, 100);
      } else if (cmd === 'returnables-registry' || cmd === 'returnables-dashboard') {
        setActiveTab('returnables');
      } else if (cmd === 'create-returnable-asset') {
        setActiveTab('returnables');
        setTimeout(() => {
          const clickEvent = new CustomEvent('jnas-trigger-create-asset');
          window.dispatchEvent(clickEvent);
        }, 100);
      } else if (cmd === 'track-returnable-asset') {
        setActiveTab('returnables');
        setTimeout(() => {
          const clickEvent = new CustomEvent('jnas-trigger-track-asset');
          window.dispatchEvent(clickEvent);
        }, 100);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  // Watch last command execution context
  useEffect(() => {
    const lastCmd = (window as any).__lastPackagingCommand;
    if (lastCmd) {
      eventBus.publish('CMD_PACKAGING', { command: lastCmd }, { emitter: 'PageLoader' });
      (window as any).__lastPackagingCommand = null;
    }
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#070B13] overflow-hidden">
      {/* Header filter & context row */}
      <PackagingHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        role={role}
        setRole={(r) => {
          packagingRegistry.setCurrentRole(r);
          setRole(r);
          refreshRegistryState();
        }}
        department={department}
        setDepartment={(d) => {
          packagingRegistry.setCurrentDepartment(d);
          setDepartment(d);
          refreshRegistryState();
        }}
        onRefresh={refreshRegistryState}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar directory */}
        <PackagingSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          projectCount={projects.length}
          materialCount={materials.length}
          componentCount={components.length}
          designCount={designs.length}
          ruleCount={rules.length}
          logisticsCount={logisticsRegistry.getLoadPlans().length}
          returnablesCount={returnablesCount}
        />

        {/* Primary workspace sheet */}
        <PackagingWorkspace
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          projects={projects}
          materials={materials}
          components={components}
          standards={standards}
          auditLogs={auditLogs}
          role={role}
          department={department}
          searchQuery={searchQuery}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          designs={designs}
          rules={rules}
          validationRuns={validationRuns}
          onRefresh={refreshRegistryState}
        />
      </div>
    </div>
  );
};
export default PackagingPage;
