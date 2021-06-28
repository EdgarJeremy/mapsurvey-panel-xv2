import React from 'react';
import { Segment, Divider, Button, Icon, Card, Label, Modal, Form, Grid, Select, Message, Checkbox, Input } from 'semantic-ui-react';
import fileDownload from 'js-file-download';
import { Site } from '../../services/requests';
import swal from 'sweetalert';
import Wait from '../../components/Wait';

export default class SiteSub extends React.Component {

    state = {
        sites: [],

        addSiteName: '',
        popupAdd: false,
        addFields: [{ name: 'nama', type: 'string' }],

        editSiteName: '',
        popupEdit: false,
        editFields: [{ name: 'nama', type: 'string' }],
        editId: null,

        popupExport: false,
        exportSite: { fields: {} },
        exportConf: {
            attributes: {
                metadata: {
                    id: true,
                    latitude: true,
                    longitude: true,
                    image: true,
                    created_at: true,
                    updated_at: true
                },
                fields: {}
            },
            attrStyle: 'original',
            content: 's'
        },

        loading: false,
        loadingText: ''
    }

    componentDidMount() {
        this._fetchSites();
    }

    _onAddPopup() {
        this.setState({ popupAdd: true });
    }

    _fetchSites() {
        this._setLoading(true, 'Mengambil data site..');
        Site.index().then((res) => {
            this.setState({
                sites: res.data.rows
            });
            this._setLoading(false);
        });
    }

    _setLoading(loading, loadingText) {
        this.setState({ loading, loadingText });
    }

    _onChangeAddFieldName(e, i) {
        let { addFields } = this.state;
        addFields[i].name = e.target.value;
        this.setState({ addFields });
    }

    _onChangeAddFieldType(e, t, i) {
        let { addFields } = this.state;
        addFields[i].type = t.value;
        this.setState({ addFields });
    }

    _onChangeEditFieldName(e, i) {
        let { editFields } = this.state;
        editFields[i].name = e.target.value;
        this.setState({ editFields });
    }

    _onChangeEditFieldType(e, t, i) {
        let { editFields } = this.state;
        editFields[i].type = t.value;
        this.setState({ editFields });
    }

    _onSubmitAdd(e) {
        let data = {
            name: this.state.addSiteName,
            fields: {}
        };
        this.state.addFields.forEach((field) => {
            data.fields[field.name] = field.type;
        });
        this.setState({ popupAdd: false });
        this._setLoading(true, 'Mengirim data site..');
        Site.save(data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil disimpan', 'success').then(this._fetchSites.bind(this));
            } else {
                swal('Error', res.message, 'error').then(this._fetchSites.bind(this));
            }
            this.setState({
                popupAdd: false, addFields: [{ name: 'nama', type: 'string' }],
                addSiteName: '',
            });
        });
    }


    _onSubmitEdit(e) {
        let data = {
            name: this.state.editSiteName,
            fields: {}
        };
        this.state.editFields.forEach((field) => {
            data.fields[field.name] = field.type;
        });
        data.id = this.state.editId;
        this.setState({ popupEdit: false });
        this._setLoading(true, 'Mengupdate data site..');
        Site.edit(data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil disimpan', 'success').then(this._fetchSites.bind(this));
            } else {
                swal('Error', 'Data gagal disimpan', 'error').then(this._fetchSites.bind(this));
            }
            this.setState({
                popupEdit: false,
                editFields: [{ name: 'nama', type: 'string' }],
                editSiteName: ''
            });
        });
    }

    _onDeleteSite(id) {
        swal({
            title: "Anda yakin?",
            text: "Anda akan menghapus site ini",
            icon: "warning",
            buttons: [
                'Tidak',
                'Ya'
            ],
            dangerMode: true,
        }).then((isConfirm) => {
            if (isConfirm) {
                this._setLoading(true, 'Menghapus site..');
                Site.delete(id).then((res) => {
                    this._setLoading(false);
                    if (res.status) {
                        swal('Konfirmasi', 'Data berhasil dihapus', 'success').then(this._fetchSites.bind(this));
                    } else {
                        swal('Error', 'Data gagal disimpan', 'error').bind(this._fetchSites.bind(this));
                    }
                    this.setState({ popupAdd: false });
                });
            }
        });
    }

    _onExportPopup(site) {
        let { exportConf } = this.state;
        exportConf.attributes = {
            metadata: {
                id: true,
                latitude: true,
                longitude: true,
                image: true,
                created_at: true,
                updated_at: true
            },
            fields: {

            }
        };
        let attrs = Object.keys(site.fields);
        attrs.forEach((attr) => {
            exportConf.attributes.fields[attr] = true;
        });
        this.setState({
            popupExport: true,
            exportSite: site,
            exportConf
        });
    }

    _onExport(type) {
        let { exportSite, exportConf } = this.state;
        let query = {};
        query.attributes = [];
        Object.keys(exportConf.attributes.metadata).forEach((field) => {
            if(exportConf.attributes.metadata[field]) {
                query.attributes.push(field);
            }
        });
        Object.keys(exportConf.attributes.fields).forEach((field) => {
            if(exportConf.attributes.fields[field]) {
                query.attributes.push(field);
            }
        });
        query.style = exportConf.attrStyle;
        query.content = exportConf.content;
        if(type === 'sql') {
            this._setLoading(true, 'Membuat query..');
            Site.export(exportSite.id, query).then((res) => {
                this._setLoading(false);
                if (res.status) {
                    fileDownload(res.data.parsed, `[${res.data.data.name}][MapSurvey Export] - ${new Date().toISOString()}.sql`);
                } else {
                    swal('Error', res.message, 'error')
                }
            });
        } else {
            alert(`Mode export ${type} masih dalam tahap pengembangan`);
        }
    }

    _onEditPopup(site) {
        let fields = [];
        Object.keys(site.fields).forEach((field, i) => {
            let data = {};
            data.name = field;
            data.type = site.fields[field];
            fields.push(data);
        });
        this.setState({ popupEdit: true, editSiteName: site.name, editFields: fields, editId: site.id });
    }

    _checkAttrStyleChange(e, { value }) {
        let { exportConf } = this.state;
        exportConf.attrStyle = value;
        this.setState({ exportConf });
    }

    _checkContentChange(e, { value }) {
        let { exportConf } = this.state;
        exportConf.content = value;
        this.setState({ exportConf });
    }

    render() {
        const { sites, popupExport, exportSite, exportConf, popupAdd, addFields, popupEdit, editFields, loading, loadingText } = this.state;

        return (
            <div>
                {loading ? <Wait visible={true} text={loadingText} /> :
                    (
                        <div>
                            <Segment>
                                <Divider />
                                <h2>Manajemen Site</h2>
                                <Divider />
                                <Button animated='vertical' color="green" onClick={this._onAddPopup.bind(this)}>
                                    <Button.Content hidden>Tambah</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='plus' />
                                    </Button.Content>
                                </Button>
                                <Button animated='vertical' color="blue">
                                    <Button.Content hidden>List</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='list' />
                                    </Button.Content>
                                </Button>
                                <Divider />
                                <Card.Group>
                                    {(sites.length) ? (sites.map((site, i) => (
                                        <Card key={i}>
                                            <Card.Content>
                                                <Card.Header>{site.name}</Card.Header>
                                                <Card.Meta>Site</Card.Meta>
                                                <Card.Description>
                                                    {(Object.keys(site.fields).map((field, k) => {
                                                        return (
                                                            <div key={k}>
                                                                <Label ribbon as='a'><Icon color={site.fields[field] === "string" ? "yellow" : "green"} name={site.fields[field] === "string" ? "font" : "hashtag"} /> {field}</Label>
                                                            </div>
                                                        );
                                                    }))}
                                                </Card.Description>
                                            </Card.Content>
                                            <Card.Content extra>
                                                <div className='ui two buttons'>
                                                    <Button animated='vertical' color="green" basic onClick={() => this._onEditPopup(site)}>
                                                        <Button.Content visible>Edit</Button.Content>
                                                        <Button.Content hidden>
                                                            <Icon name='edit' />
                                                        </Button.Content>
                                                    </Button>
                                                    <Button animated='vertical' color="red" basic onClick={() => this._onDeleteSite(site.id)}>
                                                        <Button.Content visible>Hapus</Button.Content>
                                                        <Button.Content hidden>
                                                            <Icon name='trash' />
                                                        </Button.Content>
                                                    </Button>
                                                </div>
                                                <div className="ui divider" style={{
                                                    marginTop: 5,
                                                    marginBottom: 5
                                                }}></div>
                                                <div className="ui">
                                                    <Button animated='vertical' color="teal" fluid basic onClick={() => this._onExportPopup(site)}>
                                                        <Button.Content visible>Export</Button.Content>
                                                        <Button.Content hidden>
                                                            <Icon name='download' />
                                                        </Button.Content>
                                                    </Button>
                                                </div>
                                            </Card.Content>
                                        </Card>
                                    ))) :
                                        (<Message
                                            header="Data kosong"
                                            content="Belum ada data yang diinput"
                                            icon="folder open outline"
                                        />)}
                                </Card.Group>
                            </Segment>

                            <Modal dimmer="blurring" open={popupAdd} onClose={() => this.setState({ popupAdd: false })} closeIcon>
                                <Modal.Header>Tambah Site Baru</Modal.Header>
                                <Modal.Content>
                                    <Form onSubmit={this._onSubmitAdd.bind(this)}>
                                        <Form.Field>
                                            <label>Nama Site</label>
                                            <input onChange={(e) => {
                                                this.setState({
                                                    addSiteName: e.target.value
                                                });
                                            }} value={this.state.addSiteName} placeholder='Nama' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Fields</label>
                                            <Grid columns={3} divided>
                                                {(addFields.map((field, i) => (
                                                    <Grid.Row key={i}>
                                                        <Grid.Column>
                                                            <input disabled={i === 0} required value={this.state.addFields[i].name} onChange={(e) => this._onChangeAddFieldName(e, i)} placeholder='Nama Field' />
                                                        </Grid.Column>
                                                        <Grid.Column>
                                                            <Select disabled={i === 0} required value={this.state.addFields[i].type} onChange={(e, t) => this._onChangeAddFieldType(e, t, i)} fluid placeholder='Tipe Data' options={[
                                                                { key: 0, value: 'string', text: 'String' },
                                                                { key: 1, value: 'number', text: 'Number' }
                                                            ]} />
                                                        </Grid.Column>
                                                        <Grid.Column>
                                                            <Button icon="times" fluid color="red" disabled={i === 0} onClick={() => {
                                                                let { addFields } = this.state;
                                                                addFields.splice(i, 1);
                                                                this.setState({ addFields });
                                                            }} />
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                )))}
                                            </Grid>
                                            <Divider />
                                            <Button color="teal" icon="plus" onClick={() => {
                                                let { addFields } = this.state;
                                                addFields.push({
                                                    name: '',
                                                    type: ''
                                                });
                                                this.setState({ addFields });
                                            }} />
                                        </Form.Field>
                                        <Button type='submit'>Simpan</Button>
                                    </Form>
                                </Modal.Content>
                            </Modal>

                            <Modal dimmer="blurring" open={popupEdit} onClose={() => this.setState({ popupEdit: false })} closeIcon>
                                <Modal.Header>Edit Site</Modal.Header>
                                <Modal.Content>
                                    <Form onSubmit={this._onSubmitEdit.bind(this)}>
                                        <Form.Field>
                                            <label>Nama Site</label>
                                            <input onChange={(e) => {
                                                this.setState({
                                                    editSiteName: e.target.value
                                                });
                                            }} value={this.state.editSiteName} placeholder='Nama' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Fields</label>
                                            <Grid columns={3} divided>
                                                {(editFields.map((field, i) => (
                                                    <Grid.Row key={i}>
                                                        <Grid.Column>
                                                            <input disabled={i === 0} required value={this.state.editFields[i].name} onChange={(e) => this._onChangeEditFieldName(e, i)} placeholder='Nama Field' />
                                                        </Grid.Column>
                                                        <Grid.Column>
                                                            <Select disabled={i === 0} required value={this.state.editFields[i].type} onChange={(e, t) => this._onChangeEditFieldType(e, t, i)} fluid placeholder='Tipe Data' options={[
                                                                { key: 0, value: 'string', text: 'String' },
                                                                { key: 1, value: 'number', text: 'Number' }
                                                            ]} />
                                                        </Grid.Column>
                                                        <Grid.Column>
                                                            <Button icon="times" fluid color="red" disabled={i === 0} onClick={() => {
                                                                let { editFields } = this.state;
                                                                editFields.splice(i, 1);
                                                                this.setState({ editFields });
                                                            }} />
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                )))}
                                            </Grid>
                                            <Divider />
                                            <Button color="teal" icon="plus" onClick={() => {
                                                let { editFields } = this.state;
                                                editFields.push({
                                                    name: '',
                                                    type: ''
                                                });
                                                this.setState({ editFields });
                                            }} />
                                        </Form.Field>
                                        <Button type='submit'>Simpan</Button>
                                    </Form>
                                </Modal.Content>
                            </Modal>

                            <Modal dimmer="blurring" size="tiny" open={popupExport} onClose={() => this.setState({ popupExport: false })} closeIcon>
                                <Modal.Header>Export Site</Modal.Header>
                                <Modal.Content>
                                    <p>
                                        Atur konfigurasi export dibawah ini dan klik salah satu tipe file export untuk memulai proses export
                                        <br />
                                        <b>SQL</b>: export SQL akan menghasilkan file SQL yang disupport di sistem database<br />
                                        <b>Excel</b>: export Excel akan menghasilkan file spreadsheet yang berisi table data dari site yang dipilih <br />
                                        <b>JSON</b>: export JSON akan menghasilkan file JSON yang dapat di-import di sistem Mapsurvey
                                    </p>
                                    <div className="ui divider"></div>
                                    <form ref={(el) => this.export_form = el}>
                                        <b className="export-segment">Atribut</b>
                                        <Grid columns={2} divided stackable>
                                            <Grid.Row>
                                                <Grid.Column>
                                                    <span className="desc">Atribut sistem</span>
                                                    {Object.keys(exportConf.attributes.metadata).map((field, i) => {
                                                        return (
                                                            <div key={i}>
                                                                <Checkbox label={field} name={field} checked={exportConf.attributes.metadata[field]} onChange={() => {
                                                                    let { exportConf: ex } = this.state;
                                                                    ex.attributes.metadata[field] = !ex.attributes.metadata[field];
                                                                    this.setState({ exportConf: ex });
                                                                }} />
                                                            </div>
                                                        )
                                                    })}
                                                </Grid.Column>
                                                <Grid.Column>
                                                    <span className="desc">Atribut terdefinisi</span>
                                                    {Object.keys(exportConf.attributes.fields).map((field, i) => {
                                                        return (
                                                            <div key={i}>
                                                                <Checkbox label={field} name={field} checked={exportConf.attributes.fields[field]} onChange={() => {
                                                                    let { exportConf: ex } = this.state;
                                                                    ex.attributes.fields[field] = !ex.attributes.fields[field];
                                                                    this.setState({ exportConf: ex });
                                                                }} />
                                                            </div>
                                                        )
                                                    })}
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>

                                        <br />
                                        <b className="export-segment">Konfigurasi gaya</b>
                                        <Checkbox radio name="style" label="Original" checked={exportConf.attrStyle === 'original'} value="original" onChange={this._checkAttrStyleChange.bind(this)} /><br />
                                        <Checkbox radio name="style" label="Camel Case (ContohField)" checked={exportConf.attrStyle === 'camelCase'} value="camelCase" onChange={this._checkAttrStyleChange.bind(this)} /><br />
                                        <Checkbox radio name="style" label="Snake Case (contoh_field)" checked={exportConf.attrStyle === 'snakeCase'} value="snakeCase" onChange={this._checkAttrStyleChange.bind(this)} /><br />
                                        <Checkbox radio name="style" label="Upper Case (CONTOH FIELD)" checked={exportConf.attrStyle === 'upperCase'} value="upperCase" onChange={this._checkAttrStyleChange.bind(this)} /><br />
                                        <Checkbox radio name="style" label="Lower Case (contoh field)" checked={exportConf.attrStyle === 'lowerCase'} value="lowerCase" onChange={this._checkAttrStyleChange.bind(this)} />
                                        <br /><br />
                                        <b className="export-segment">Konten</b>
                                        <Checkbox radio name="content" label="Hanya struktur" checked={exportConf.content === 's'} value="s" onChange={this._checkContentChange.bind(this)} /><br />
                                        <Checkbox radio name="content" label="Struktur dan data" checked={exportConf.content === 'sd'} value="sd" onChange={this._checkContentChange.bind(this)} />
                                        <br /><br />
                                        {/* <b className="export-segment">Lanjutan</b>
                                        <Input fluid type="text" label="Prefix nama entitas" /><br />
                                        <Input fluid type="text" label="Prefix nama attribut" /> */}
                                    </form>
                                    <div className="ui divider"></div>
                                    <Button.Group style={{ width: '100%' }}>
                                        <Button size="big" color="blue" onClick={() => this._onExport('sql')}>
                                            <Icon name="database" /> SQL
                                        </Button>
                                        <Button size="big" color="green" onClick={() => this._onExport('excel')}>
                                            <Icon name="file excel" /> Excel
                                        </Button>
                                        <Button size="big" color="pink" onClick={() => this._onExport('json')}>
                                            <Icon name="file code" /> JSON
                                        </Button>
                                    </Button.Group>
                                </Modal.Content>
                            </Modal>
                        </div>
                    )
                }
            </div>
        );
    }

}