import React from 'react';
import { Divider, Segment, Button, Icon, Table, Menu, Label, Modal, Form, Select } from 'semantic-ui-react';
import swal from 'sweetalert';
import moment from 'moment';
import _ from 'lodash';
import 'moment/locale/id';
import { Rent } from '../../services/requests';
import { inspect } from '../../services/utilities';
import Wait from '../../components/Wait';

export default class RentSub extends React.Component {

    state = {
        rents: [],
        total: 0,
        limit: 20,
        offset: 0,
        curPage: 1,
        popupAdd: false,
        popupEdit: false,
        addType: '',
        editFields: {
            id: null,
            tenant_name: '',
            tenant_company: '',
            tenant_email: '',
            tenant_phone: '',
            tenant_address: '',
            tenant_description: '',
            object_quota: 0
        },
        loading: false,
        loadingText: ''
    }

    componentDidMount() {
        this._loadRentData();
    }

    _loadRentData() {
        let { limit, offset } = this.state;
        this._setLoading(true, 'Mengambil data sewaan..');
        Rent.index(limit, offset).then((res) => {
            this.setState({ rents: res.data.rows, total: res.data.count }, () => this._setLoading(false));
        });
    }

    _setLoading(loading, loadingText) {
        this.setState({ loading, loadingText });
    }

    _onAddPopup() {
        this.setState({ popupAdd: true });
    }

    _onEditPopup(user) {
        this.setState({ popupEdit: true, editFields: { ...user } });
    }

    _onSubmitAdd(e) {
        let { addType: type } = this.state;
        let data = inspect(e.target);
        data.type = type;
        this.setState({ popupAdd: false });
        this._setLoading(true, 'Menyimpan data..');
        Rent.save(data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil disimpan', 'success').then(this._loadRentData.bind(this));
            } else {
                swal('Error', 'Data gagal disimpan', 'error').then(this._loadRentData.bind(this));
            }
        });
        this.setState({
            addType: ''
        });
    }

    _onSubmitEdit() {
        let { editFields: data } = this.state;
        this.setState({ popupEdit: false });
        this._setLoading(true, 'Mengupdate data..');
        Rent.edit(data.id, data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil diupdate', 'success').then(this._loadRentData.bind(this));
            } else {
                swal('Error', 'Data gagal diupdate', 'error').then(this._loadRentData.bind(this));
            }
        });
        this.setState({
            addType: '',
            editFields: {
                id: null,
                tenant_name: '',
                tenant_company: '',
                tenant_email: '',
                tenant_phone: '',
                tenant_address: '',
                tenant_description: '',
                object_quota: 0
            }
        });
    }

    _onDeleteRent(id) {
        swal({
            title: "Anda yakin?",
            text: "Anda akan menghapus sewaan ini",
            icon: "warning",
            buttons: [
                'Tidak',
                'Ya'
            ],
            dangerMode: true,
        }).then((isConfirm) => {
            if (isConfirm) {
                this._setLoading(true, 'Menghapus Sewaan..');
                Rent.delete(id).then((res) => {
                    this._setLoading(false);
                    if (res.status) {
                        swal('Konfirmasi', 'Sewaan berhasil dihapus', 'success').then(this._loadRentData.bind(this));
                    } else {
                        swal('Error', 'Sewaan gagal disimpan', 'error').bind(this._loadRentData.bind(this));
                    }
                });
            }
        });
    }

    _switchPage(page) {
        this.setState({
            offset: this.state.limit * page,
            curPage: page + 1
        }, this._loadRentData.bind(this));
    }

    render() {
        const { rents, total, limit, curPage, popupAdd, addType, me, popupEdit, editFields, loading, loadingText } = this.state;
        const pageButtons = [];
        for (let i = 0; i < Math.ceil(total / limit); i++) {
            pageButtons.push(
                <Menu.Item active={i + 1 === curPage} as='a' key={i} onClick={() => this._switchPage(i)}>{i + 1}</Menu.Item>
            );
        }
        return (
            <div>
                {loading ? <Wait visible={true} text={loadingText} /> :
                    (
                        <div>
                            <Segment>
                                <Divider />
                                <h2>Manajemen Sewaan</h2>
                                <Divider />
                                <Button animated="vertical" color="green" onClick={this._onAddPopup.bind(this)}>
                                    <Button.Content hidden>Tambah</Button.Content>
                                    <Button.Content visible>
                                        <Icon name="plus" />
                                    </Button.Content>
                                </Button>
                                <Divider />
                                <Table celled>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Nama Penyewa</Table.HeaderCell>
                                            <Table.HeaderCell>Perusahaan</Table.HeaderCell>
                                            <Table.HeaderCell>Email</Table.HeaderCell>
                                            <Table.HeaderCell>Telefon</Table.HeaderCell>
                                            <Table.HeaderCell>Alamat</Table.HeaderCell>
                                            <Table.HeaderCell>Deskripsi</Table.HeaderCell>
                                            <Table.HeaderCell>Kuota Objek</Table.HeaderCell>
                                            <Table.HeaderCell>Waktu Pendaftaran</Table.HeaderCell>
                                            <Table.HeaderCell>Pilihan</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>

                                    <Table.Body>
                                        {me !== null && (
                                            (rents.map((rent, i) => (
                                                <Table.Row key={i}>
                                                    <Table.Cell>{rent.tenant_name}</Table.Cell>
                                                    <Table.Cell>{rent.tenant_company}</Table.Cell>
                                                    <Table.Cell>{rent.tenant_email}</Table.Cell>
                                                    <Table.Cell>{rent.tenant_phone}</Table.Cell>
                                                    <Table.Cell>{rent.tenant_address}</Table.Cell>
                                                    <Table.Cell>[<a href="javascript:void(0)" onClick={() => swal(rent.tenant_description)}>baca</a>]</Table.Cell>
                                                    <Table.Cell>{rent.object_quota}</Table.Cell>
                                                    <Table.Cell>{moment(rent.created_at).format('MMMM Do YYYY, h:mm:ss a')}</Table.Cell>
                                                    <Table.Cell>
                                                        {/* <Button animated color="blue" basic>
                                                <Button.Content hidden>Detail</Button.Content>
                                                <Button.Content visible>
                                                    <Icon name="eye" />
                                                </Button.Content>
                                            </Button> */}
                                                        <Button animated color="green" onClick={() => this._onEditPopup(rent)} basic>
                                                            <Button.Content hidden>Edit</Button.Content>
                                                            <Button.Content visible>
                                                                <Icon name="edit" />
                                                            </Button.Content>
                                                        </Button>
                                                        <Button animated color="red" onClick={() => this._onDeleteRent(rent.id)} basic>
                                                            <Button.Content hidden>Hapus</Button.Content>
                                                            <Button.Content visible>
                                                                <Icon name="trash" />
                                                            </Button.Content>
                                                        </Button>
                                                    </Table.Cell>
                                                </Table.Row>
                                            )))
                                        )}
                                    </Table.Body>

                                    <Table.Footer>
                                        <Table.Row>
                                            <Table.HeaderCell colSpan='9'>
                                                {(pageButtons.length > 1) && (
                                                    <Menu floated='right' pagination>
                                                        <Menu.Item disabled={this.state.curPage === 1} onClick={() => {
                                                            this._switchPage(this.state.curPage - 1 - 1);
                                                        }} as='a' icon>
                                                            <Icon name='chevron left' />
                                                        </Menu.Item>
                                                        {pageButtons}
                                                        <Menu.Item disabled={this.state.curPage === Math.ceil(total / limit)} onClick={() => {
                                                            this._switchPage(this.state.curPage - 1 + 1);
                                                        }} as='a' icon>
                                                            <Icon name='chevron right' />
                                                        </Menu.Item>
                                                    </Menu>
                                                )}
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Footer>
                                </Table>
                            </Segment>

                            <Modal open={popupAdd} onClose={() => this.setState({ popupAdd: false })} closeIcon>
                                <Modal.Header>Tambah Sewaan Baru</Modal.Header>
                                <Modal.Content>
                                    <Form method="post" onSubmit={this._onSubmitAdd.bind(this)}>
                                        <Form.Field>
                                            <label>Nama Penyewa</label>
                                            <input required name="tenant_name" placeholder='Nama Penyewa' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Perusahaan</label>
                                            <input required name="tenant_company" placeholder='Perusahaan' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Email</label>
                                            <input required name="tenant_email" placeholder='Email' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Telefon</label>
                                            <input required name="tenant_phone" placeholder='Telefon' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Alamat</label>
                                            <input required name="tenant_address" placeholder='Alamat' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Kuota Objek</label>
                                            <input required name="object_quota" type="number" placeholder='Kuota Objek' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Deskripsi</label>
                                            <textarea name="tenant_description" placeholder='Deskripsi'></textarea>
                                        </Form.Field>

                                        <Divider />
                                        <Button type="submit">Simpan</Button>
                                    </Form>
                                </Modal.Content>
                            </Modal>

                            <Modal open={popupEdit} onClose={() => this.setState({ popupEdit: false })} closeIcon>
                                <Modal.Header>Edit Sewaan</Modal.Header>
                                <Modal.Content>
                                    <Form method="post" onSubmit={this._onSubmitEdit.bind(this)}>
                                        <Form.Field>
                                            <label>Nama Penyewa</label>
                                            <input required value={editFields.tenant_name} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.tenant_name = e.target.value;
                                                this.setState({ editFields });
                                            }} name="tenant_name" placeholder='Nama' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Perusahaan</label>
                                            <input required value={editFields.tenant_company} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.tenant_company = e.target.value;
                                                this.setState({ editFields });
                                            }} name="tenant_company" placeholder='Perusahaan' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Email</label>
                                            <input required value={editFields.tenant_email} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.tenant_email = e.target.value;
                                                this.setState({ editFields });
                                            }} name="tenant_email" placeholder='Email' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Telefon</label>
                                            <input required value={editFields.tenant_phone} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.tenant_phone = e.target.value;
                                                this.setState({ editFields });
                                            }} name="tenant_phone" placeholder='Telefon' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Alamat</label>
                                            <input required value={editFields.tenant_address} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.tenant_address = e.target.value;
                                                this.setState({ editFields });
                                            }} name="tenant_address" placeholder='Alamat' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Kuota Objek</label>
                                            <input required value={editFields.object_quota} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.object_quota = e.target.value;
                                                this.setState({ editFields });
                                            }} name="object_quota" placeholder='Kuota Objek' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Deskripsi</label>
                                            <textarea value={editFields.tenant_description} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.tenant_description = e.target.value;
                                                this.setState({ editFields });
                                            }} name="tenant_description" placeholder='Deskripsi'></textarea>
                                        </Form.Field>

                                        <Divider />
                                        <Button type="submit">Simpan</Button>
                                    </Form>
                                </Modal.Content>
                            </Modal>
                        </div>
                    )
                }
            </div>
        );
    }

}