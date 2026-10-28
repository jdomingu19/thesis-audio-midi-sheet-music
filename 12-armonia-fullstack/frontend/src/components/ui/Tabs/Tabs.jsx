// thesis-audio-midi-sheet-music
// @jdomingu19
// Tabs.jsx

import { createContext, useContext } from "react";
import clsx from "clsx";
import styles from "./Tabs.module.css";

const TabsContext = createContext(null);

function useTabsContext(component) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<Tabs.${component} /> debe usarse dentro de <Tabs>`);
  }
  return context;
}

/**
 * Tabs — componente compuesto controlado.
 *
 * <Tabs value={activeTab} onChange={setActiveTab}>
 *   <Tabs.List>
 *     <Tabs.Tab value="piano-roll">Piano Roll</Tabs.Tab>
 *     <Tabs.Tab value="sheet-music">Sheet Music</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panels>
 *     <Tabs.Panel value="piano-roll">...</Tabs.Panel>
 *     <Tabs.Panel value="sheet-music">...</Tabs.Panel>
 *   </Tabs.Panels>
 * </Tabs>
 */
function Tabs({ value, onChange, children, className, ...rest }) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={clsx(styles.tabs, className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className, ...rest }) {
  return (
    <div role="tablist" className={clsx(styles.list, className)} {...rest}>
      {children}
    </div>
  );
}

function Tab({ value, children, disabled = false, className, ...rest }) {
  const { value: activeValue, onChange } = useTabsContext("Tab");
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={clsx(styles.tab, isActive && styles.active, className)}
      onClick={() => onChange?.(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

function Panels({ children, className, ...rest }) {
  return (
    <div className={clsx(styles.panels, className)} {...rest}>
      {children}
    </div>
  );
}

function Panel({ value, children, className, ...rest }) {
  const { value: activeValue } = useTabsContext("Panel");
  if (activeValue !== value) return null;

  return (
    <div role="tabpanel" className={clsx(styles.panel, className)} {...rest}>
      {children}
    </div>
  );
}

Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panels = Panels;
Tabs.Panel = Panel;

export default Tabs;
