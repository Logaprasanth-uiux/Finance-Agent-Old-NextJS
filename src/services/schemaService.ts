import schemaData from '../data/schema/schema.json';

export interface Tab {
  id: string;
  name: string;
}

export interface Container {
  id: string;
  title: string;
  isCollapsed: boolean;
  data: any; // Raw JSON object (either a field object or schema config object)
}

class SchemaService {
  private data: any[];

  constructor() {
    this.data = schemaData;
  }

  /**
   * Returns workspace tabs dynamically parsed from JSON.
   * Standard metadata objects with a Section generate their own Tab, using:
   * - Section as the internal unique ID
   * - Description as the visible tab title Name
   * Elements without a Section are grouped under a single dedicated "Schema" tab.
   */
  getWorkspaceTabs(): Tab[] {
    const tabs: Tab[] = [];
    let hasSchemaConfig = false;

    this.data.forEach(item => {
      if (item.Section) {
        tabs.push({
          id: item.Section, // Use Section as the unique internal identifier
          name: item.Description || item.Section // Use Description as the visible tab title
        });
      } else {
        hasSchemaConfig = true;
      }
    });

    if (hasSchemaConfig) {
      tabs.push({
        id: 'schema-tab',
        name: 'Schema'
      });
    }

    return tabs;
  }

  /**
   * Gets containers for a given tabId (either a Section identifier or 'schema-tab').
   * - In standard Section tabs, every SourceFields object renders directly as a container.
   * - In the Schema tab, non-section metadata objects render as containers.
   */
  getContainers(tabId: string): Container[] {
    if (tabId === 'schema-tab') {
      const nonSectionItems = this.data.filter(item => !item.Section);
      return nonSectionItems.map((item, idx) => {
        const id = item.SchemaKey || `schema-c-${idx}`;
        const title = item.Type || 'Schema Configuration';
        return {
          id,
          title,
          isCollapsed: false,
          data: item
        };
      });
    } else {
      const item = this.data.find(item => item.Section === tabId);
      if (!item || !item.SourceFields) return [];

      return item.SourceFields.map((f: any, idx: number) => {
        const id = f.FieldID?.toString() || `f-${tabId}-${idx}`;
        const title = f.FieldName || 'Unnamed Field';
        return {
          id,
          title,
          isCollapsed: true, // Collapsed by default for a clean initial outline view
          data: f
        };
      });
    }
  }

  /**
   * Reusable method to fetch data directly from a container object.
   */
  getFields(container: Container): any {
    return container.data;
  }
}

export const schemaService = new SchemaService();
export default schemaService;
