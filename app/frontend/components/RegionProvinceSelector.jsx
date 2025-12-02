import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const philippineData = {
    "01": { "region_name": "REGION I (Ilocos Region)", "province_list": ["ILOCOS NORTE", "ILOCOS SUR", "LA UNION", "PANGASINAN"] },
    "02": { "region_name": "REGION II (Cagayan Valley)", "province_list": ["BATANES", "CAGAYAN", "ISABELA", "NUEVA VIZCAYA", "QUIRINO"] },
    "03": { "region_name": "REGION III (Central Luzon)", "province_list": ["AURORA", "BATAAN", "BULACAN", "NUEVA ECIJA", "PAMPANGA", "TARLAC", "ZAMBALES"] },
    "4A": { "region_name": "REGION IV-A (CALABARZON)", "province_list": ["BATANGAS", "CAVITE", "LAGUNA", "QUEZON", "RIZAL"] },
    "4B": { "region_name": "REGION IV-B (MIMAROPA)", "province_list": ["MARINDUQUE", "OCCIDENTAL MINDORO", "ORIENTAL MINDORO", "PALAWAN", "ROMBLON"] },
    "05": { "region_name": "REGION V (Bicol Region)", "province_list": ["ALBAY", "CAMARINES NORTE", "CAMARINES SUR", "CATANDUANES", "MASBATE", "SORSOGON"] },
    "06": { "region_name": "REGION VI (Western Visayas)", "province_list": ["AKLAN", "ANTIQUE", "CAPIZ", "GUIMARAS", "ILOILO", "NEGROS OCCIDENTAL"] },
    "07": { "region_name": "REGION VII (Central Visayas)", "province_list": ["BOHOL", "CEBU", "NEGROS ORIENTAL", "SIQUIJOR"] },
    "08": { "region_name": "REGION VIII (Eastern Visayas)", "province_list": ["BILIRAN", "EASTERN SAMAR", "LEYTE", "NORTHERN SAMAR", "SAMAR (WESTERN SAMAR)", "SOUTHERN LEYTE"] },
    "09": { "region_name": "REGION IX (Zamboanga Peninsula)", "province_list": ["ZAMBOANGA DEL NORTE", "ZAMBOANGA DEL SUR", "ZAMBOANGA SIBUGAY"] },
    "10": { "region_name": "REGION X (Northern Mindanao)", "province_list": ["BUKIDNON", "CAMIGUIN", "LANAO DEL NORTE", "MISAMIS OCCIDENTAL", "MISAMIS ORIENTAL"] },
    "11": { "region_name": "REGION XI (Davao Region)", "province_list": ["COMPOSTELA VALLEY", "DAVAO DEL NORTE", "DAVAO DEL SUR", "DAVAO ORIENTAL"] },
    "12": { "region_name": "REGION XII (SOCCSKSARGEN)", "province_list": ["COTABATO (NORTH COTABATO)", "SARANGANI", "SOUTH COTABATO", "SULTAN KUDARAT"] },
    "13": { "region_name": "National Capital Region (NCR)", "province_list": ["Metro Manila"] },
    "14": { "region_name": "Cordillera Administrative Region (CAR)", "province_list": ["ABRA", "APAYAO", "BENGUET", "IFUGAO", "KALINGA", "MOUNTAIN PROVINCE"] },
    "15": { "region_name": "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)", "province_list": ["BASILAN", "LANAO DEL SUR", "MAGUINDANAO", "SULU", "TAWI-TAWI"] },
};

const regions = Object.values(philippineData).map(item => item.region_name);

const RegionProvinceSelector = () => {
    const [regionModalVisible, setRegionModalVisible] = useState(false);
    const [provinceModalVisible, setProvinceModalVisible] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [provinces, setProvinces] = useState([]);

    const handleSelectRegion = (region) => {
        setSelectedRegion(region);
        const regionData = Object.values(philippineData).find(item => item.region_name === region);
        setProvinces(regionData ? regionData.province_list : []);
        setSelectedProvince(null);
        setRegionModalVisible(false);
    };

    const handleSelectProvince = (province) => {
        setSelectedProvince(province);
        setProvinceModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Region Selector */}
            <Text style={styles.label}>Region</Text>
            <TouchableOpacity style={styles.input} onPress={() => setRegionModalVisible(true)}>
                <Text>{selectedRegion || 'Select Region'}</Text>
            </TouchableOpacity>

            {/* Province Selector */}
            <Text style={styles.label}>Province</Text>
            <TouchableOpacity style={styles.input} onPress={() => setProvinceModalVisible(true)} disabled={!selectedRegion}>
                <Text>{selectedProvince || 'Select Province'}</Text>
            </TouchableOpacity>

            {/* Region Modal */}
            <Modal
                transparent={true}
                visible={regionModalVisible}
                animationType="fade"
                onRequestClose={() => setRegionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setRegionModalVisible(false)}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <FlatList
                            data={regions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectRegion(item)}>
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Province Modal */}
            <Modal
                transparent={true}
                visible={provinceModalVisible}
                animationType="fade"
                onRequestClose={() => setProvinceModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setProvinceModalVisible(false)}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <FlatList
                            data={provinces}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectProvince(item)}>
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 12,
        marginBottom: 16,
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});

export default RegionProvinceSelector;
